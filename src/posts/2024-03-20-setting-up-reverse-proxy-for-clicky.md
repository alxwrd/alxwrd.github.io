---
title: "Setting up a reverse proxy for clicky.com"
date: 2024-03-21 13:00:00
tags: []
author: "Alex Ward"
---

Clicky is a "privacy-friendly website analytics" which provides insights into a
websites visitor numbers without the need for tracking cookies. I've been
trialling Clicky for about three weeks at this point - and while my visitor
numbers are low, it's nice to see that on occasion people are finding what I've
build!

1. [Uh-oh, ad-blockers!](#uh-oh-ad-blockers)
1. [Setting up the instance](#setting-up-the-instance)
1. [Setting up nginx](#setting-up-nginx)
1. [Getting an SSL certificate](#getting-an-ssl-certificate)
1. [Integrating with my sites](#integrating-with-my-sites)


## Uh-oh, ad-blockers!

One problem is ad-blockers block trackers in addition to ads, including Clicky.
For ad-serving services with tracking, like Google and Facebook, I think this is
fair. However, I just want to see my ~20 site views a week and get some
satisfaction that I'm not shouting into the void.

_(If you disagree, Clicky offers a global opt-out for all sites using their
service which can be found on their [opt-out page][optout])_

[optout]: https://clicky.com/optout "Clicky opt-out"

Clicky has a solution to the blocking which uses a reverse proxy to serve the
Javascript and beacon via your own domain.

I wanted to set this up, so I decided to have a go using a compute instance in
[Oracle Cloud] as I have usage spare under [free tier].

[oracle cloud]: https://www.oracle.com/uk/cloud/ "Oracle Cloud Infrastructure"
[free tier]: https://www.oracle.com/uk/cloud/free/ "Oracle Cloud Infrastructure free tier"

## Setting up the instance

I started by spinning up a `VM.Standard.E2.1.Micro` instance running Oracle
Linux 8, which is free-tier eligible and comes with 1 OPCU and 1GB of RAM.

Once it was running I could connect over ssh and begin by installing nginx.

To start I wanted to update all current packages:

```shell
sudo dnf upgrade
```

This chugged along, but eventually the output stopped and the ssh session became
unresponsive. I was unable to reconnect, so I rebooted the instance and tried
again - only to experience the same result!

After another reboot I opened two ssh sessions - in one session I ran
`dnf upgrade` and in the other I ran `top`. I observed that before long
`dnf` ran out of memory.

The instance was configured with 1GB of swap space, so after I increased that to
4GB and everything started to go a lot smoother.

```shell
sudo swapoff /.swapfile
sudo dd if=/dev/zero of=/.swapfile bs=1M count=4096
sudo mkswap /.swapfile
sudo swapon /.swapfile
```

## Setting up nginx

I was now able to install nginx, start the service, and add http and https
firewall exceptions.

```shell
sudo dnf install -y nginx
sudo systemctl enable --now nginx.service
sudo systemctl status nginx
sudo firewall-cmd --add-service={http,https} --permanent
sudo firewall-cmd --reload
```

Oracle Linux has [SELinux] enabled meaning the ability to forward
traffic would need to be explicitly enabled too.

```shell
sudo setsebool -P httpd_can_network_relay 1
```

[selinux]: https://en.wikipedia.org/wiki/Security-Enhanced_Linux "Security-Enhanced Linux"

As this server would just be forwarding traffic, I opted to configure nginx
simply in `/etc/nginx/nginx.conf` instead of breaking everything up. I
configured the server as per Clicky's documentation and arrived at the
following configuration:

<details>
<summary><code>/etc/nginx/nginx.conf</code></summary>

```perl
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    server {
        server_name  clicky.textstat.org;

        set $cookie "";
        if ($cookie__cky_ignore) {
            set $cookie "_cky_ignore=$cookie__cky_ignore; _cky_osa=$cookie__cky_osa";
        }

        location = /626b4fc074e.js {
            proxy_pass https://static.getclicky.com/js?in=%2Fb6bbbd0c429;
            proxy_connect_timeout 10s;
            proxy_http_version 1.1;
            proxy_ssl_server_name on;
            proxy_set_header Host static.getclicky.com;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Cookie "";
        }

        location = /b6bbbd0c429 {
            proxy_pass https://in.getclicky.com/in.php;
            proxy_connect_timeout 10s;
            proxy_http_version 1.1;
            proxy_ssl_server_name on;
            proxy_set_header Host in.getclicky.com;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host  $host;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header Cookie $cookie;
        }
    }

    server {
        server_name clicky.alxwrd.co.uk;

        set $cookie "";
        if ($cookie__cky_ignore) {
            set $cookie "_cky_ignore=$cookie__cky_ignore; _cky_osa=$cookie__cky_osa";
        }

        location = /e58b194da9.js {
            proxy_pass https://static.getclicky.com/js?in=%2F4cd02f0442;
            proxy_connect_timeout 10s;
            proxy_http_version 1.1;
            proxy_ssl_server_name on;
            proxy_set_header Host static.getclicky.com;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Cookie "";
            }

        location = /4cd02f0442 {
            proxy_pass https://in.getclicky.com/in.php;
            proxy_connect_timeout 10s;
            proxy_http_version 1.1;
            proxy_ssl_server_name on;
            proxy_set_header Host in.getclicky.com;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host  $host;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header Cookie $cookie;
        }
    }
}
```

</details>


## Getting an SSL certificate

Getting an installing an SSL certificate was super easy with
[Certbot].

I followed the [instructions for Fedora][certbot-install], but the process is:

[certbot]: https://certbot.eff.org/ "Certbot"
[certbot-install]: https://certbot.eff.org/instructions?ws=nginx&os=fedora&tab=standard "Certbot installation"

<details>
<summary>Install snapd</summary>

```shell
sudo dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
sudo dnf upgrade
sudo dnf install snapd
sudo systemctl enable --now snapd.socket
sudo ln -s /var/lib/snapd/snap /snap  # Enable classic snap support

# Then reload your shell, probably by logging out and back in
```

</details>

<details>
<summary>Install certbot</summary>

```shell
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```

</details>

<details>
<summary>Run certbot</summary>

```shell
sudo certbot --nginx
```

</details>

If you have multiple sites I recommend running certbot for each site
individually. Otherwise, the resulting certificates and configuration will be
combined into one file.


I cleaned up the `nginx.conf` after certbot had got it's hands on it, and this
is the result:

<details>
<summary><code>/etc/nginx/nginx.conf</code></summary>

```perl
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        server_name clicky.textstat.org;

        listen 443 ssl; # managed by Certbot
        ssl_certificate /etc/letsencrypt/live/clicky.textstat.org/fullchain.pem; # managed by Certbot
        ssl_certificate_key /etc/letsencrypt/live/clicky.textstat.org/privkey.pem; # managed by Certbot
        include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

        set $cookie "";
        if ($cookie__cky_ignore) {
            set $cookie "_cky_ignore=$cookie__cky_ignore; _cky_osa=$cookie__cky_osa";
        }

        location = /626b4fc074e.js {
            proxy_pass https://static.getclicky.com/js?in=%2Fb6bbbd0c429;
            proxy_connect_timeout 10s;
            proxy_http_version 1.1;
            proxy_ssl_server_name on;
            proxy_set_header Host static.getclicky.com;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Cookie "";
        }

        location = /b6bbbd0c429 {
            proxy_pass https://in.getclicky.com/in.php;
            proxy_connect_timeout 10s;
            proxy_http_version 1.1;
            proxy_ssl_server_name on;
            proxy_set_header Host in.getclicky.com;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Cookie $cookie;
        }
    }

    server {
        server_name clicky.alxwrd.co.uk;

        listen 443 ssl; # managed by Certbot
        ssl_certificate /etc/letsencrypt/live/clicky.alxwrd.co.uk/fullchain.pem; # managed by Certbot
        ssl_certificate_key /etc/letsencrypt/live/clicky.alxwrd.co.uk/privkey.pem; # managed by Certbot
        include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

        set $cookie "";
        if ($cookie__cky_ignore) {
            set $cookie "_cky_ignore=$cookie__cky_ignore; _cky_osa=$cookie__cky_osa";
        }

        location = /e58b194da9.js {
            proxy_pass https://static.getclicky.com/js?in=%2F4cd02f0442;
            proxy_connect_timeout 10s;
            proxy_http_version 1.1;
            proxy_ssl_server_name on;
            proxy_set_header Host static.getclicky.com;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Cookie "";
        }

        location = /4cd02f0442 {
            proxy_pass https://in.getclicky.com/in.php;
            proxy_connect_timeout 10s;
            proxy_http_version 1.1;
            proxy_ssl_server_name on;
            proxy_set_header Host in.getclicky.com;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Cookie $cookie;
        }
    }


    server {
        server_name clicky.textstat.org
                    clicky.alxwrd.co.uk;

        listen 80;

        if ($host = clicky.textstat.org) {
            return 301 https://$host$request_uri;
        }

        if ($host = clicky.alxwrd.co.uk) {
            return 301 https://$host$request_uri;
        }

        return 404;
    }
}
```

</details>


## Integrating with my sites

Now the reverse proxy was setup and forwarding traffic correctly, it was time to
update the integration on my sites.

I had expected the change to be fairly trivial:

```diff
- <script async data-id="101445880" src="//static.getclicky.com/js"></script>
+ <script async data-id="101445880" src="https://clicky.alxwrd.co.uk/e58b194da9.js"></script>
```

However, after some experimentation, I noticed the Javascript was served
correctly, but the beacon was being requested from the root domain, not the
clicky subdomain.

As I was now serving the Javascript myself, I could potentially make a change
that would make the beacon request got to the correct place and serve this code.
This would create an unwanted maintenance burden for me though, as I would need
to make sure I keep my forked code inline with any changes that are made.

Instead, I opted to attempt to monkey patch the code from Clicky in order to
send the traffic to the correct place.

```html
  <script data-id="101445880" src="https://clicky.alxwrd.co.uk/e58b194da9.js"></script>
  <script>
    (function () {
      const proxied = clicky.inject;

      clicky.inject = function (src, type) {
        if (src.startsWith("/4cd02f0442")) {
          return proxied(`https://clicky.alxwrd.co.uk${src}`, type);
        }

        return proxied(src, type);
      };
    })();
  </script>
```

This ended up working pretty well!
