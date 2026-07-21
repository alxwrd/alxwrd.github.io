---
title: "Setting up WebDAV for Buttercup"
date: 2024-02-29 16:00:00
tags: []
author: "Alex Ward"
---

Buttercup is a [FOSS][foss] password manager that uses encrypted archive files, or
vaults, to store passwords and secrets. In addition to being able to use vaults
locally, there is also the option to share the vaults between computers either
via a cloud storage service, like Google Drive, or via a WebDAV server.

[WebDAV][webdav] is an extension to HTTP to allow
clients to author content directly on a web server. It adds a new set of verbs
to copy, lock, and create resources.

<details>
<summary>I've actually been running Buttercup via WebDAV for about 2 years now.
<i>However...</i></summary>

<div class="italic p-4 -mb-8">
last week I ran an Ubuntu update on the instance without first taking a backup
(whoops 😬) and now the instance it was running on has no network connectivity.
It only lists the loopback device.

```
$ ifconfig
lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
```

I managed to recover the Buttercup vault files over the serial console. I could
attempt to recover the instance over the same connection but I've decided not to
mainly because I only have login information for a user without root access. So
I decided to start again and create a new instance.
</div>
</details>

The web server for this will be running in Google Cloud Platform under the free
tier allowance. For Compute Engine, this is one `e2-micro` in any `us` region
(`us-west1`, `us-central1`, or `us-east1`).





[foss]: https://en.wikipedia.org/wiki/Free_and_open-source_software "Free and open-source software"
[webdav]: https://en.wikipedia.org/wiki/Free_and_open-source_software "Web Distributed Authoring and Versioning"