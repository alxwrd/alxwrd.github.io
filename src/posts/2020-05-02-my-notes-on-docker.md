---
title:  "My notes on Docker"
date:   2020-05-02 21:30:00
tags: ["blog", "docker"]
author: "Alex Ward"
---

> *The documentation at
> [https://docs.docker.com/get-started/](https://docs.docker.com/get-started/)
> is really good and I would recommend reading through the first 2 parts. This
> post is mostly just the tutorial rehashed.*

"Docker" is a collection of applications that help package and distribute
applications. Installing Docker on a machine is similar to installing a Java
Virtual Machine. However, where a JVM abstracts the CPU, Docker abstracts an
entire system.

<!-- more -->

Docker (for the most part) is a comprised of 2 applications: the Docker
daemon and the Docker CLI. You will need at least the Docker CLI installed on
your local machine, and the Docker daemon could be running else where. Having
the daemon installed elsewhere is perhaps something you don't need to worry
about to start with though.

Docker used to be only truly a Linux application, as it relied on features
available in the Linux kernel. When installing "Docker Desktop" for Windows
or Mac, you are installing an application that is managing a Linux virtual
machine, which itself is being used to manage virtual machines...

There is however now [native Windows
support](https://www.docker.com/blog/build-your-first-docker-windows-server-container/).

## Installing

For Windows, Microsoft Hyper-V is required to run Docker Desktop. When
Hyper-V is enabled, VirtualBox no longer works.

Instructions for getting Docker installed onto your machine can be found on
the docker website.

Because Docker uses Linux kernel features, Docker doesn't currently work
directly on WSL. However, WSL2 has been released, which ships with an actual
Linux kernel. It is only available in Windows builds 18917 and higher.

- [Windows install](https://docs.docker.com/docker-for-windows/install/)
    - [WSL install](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly)
- [Mac install](https://docs.docker.com/docker-for-mac/install/)
- [Linux install](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

I currently have WSL installed, so I followed the WSL install blog post.
However, I had issues with my WSL Docker CLI communicating with the Windows
daemon. The work around I'm using involves running `socat` in a docker
container:
[https://hub.docker.com/r/alpine/socat/](https://hub.docker.com/r/alpine/socat/).

```
docker run -d --restart=always -p 127.0.0.1:2375:2375 -v /var/run/docker.sock:/var/run/docker.sock  alpine/socat  tcp-listen:2375,fork,reuseaddr unix-connect:/var/run/docker.sock
```

## First container

*This is the same steps as
[https://docs.docker.com/get-started/part2/](https://docs.docker.com/get-started/part2/)
but with one of my repos.*

### Defining a Dockerfile

Clone the project from GitHub

```bash
git clone https://github.com/alxwrd/bus-stop.git
cd bus-stop
```

This is a single page web app that displays the current bus information for
the bus stop outside the my office.

In the repo there is a file called `Dockerfile`. This is similar in concept
to a `Makefile` and is what is used to define the resulting Docker image.

```bash
FROM nginx:latest

COPY index.html /usr/share/nginx/html
COPY main.js /usr/share/nginx/html
COPY style.css /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

`FROM` specifies which image to use as the parent image. The important
concept here is that this is also just a Docker image, which could be used in
a container. Images can be found on the [Docker
Hub](https://hub.docker.com/). The Dockerfile for nginx can be found on
[GitHub](https://github.com/nginxinc/docker-nginx/blob/master/mainline/alpine/Dockerfile).

`COPY` copies a local files into the new Docker image.

`EXPOSE` opens up a port.

`CMD` runs a command in a running container.

### Building an image

You can now build an image from this Dockerfile using the command

```bash
docker image build -t bus-stop .
```

`docker image build` is the build command, while `-t bus-stop` "tags" our
resulting image. This is important because you can view images already built
on your machine using

```
repos/bus-stop$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
bus-stop            latest              ab443971cc03        2 hours ago         127MB
nginx               latest              2073e0bcb60e        3 weeks ago         127MB
```

Untagged images will just show up as

```
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
<none>              <none>              0e63f6aabdc9        22 seconds ago      154MB
```

Building an image can be seen synonymous with building or compiling source code.

Once an image is build, you can use it locally. Images can also be exported with

```
docker save bus-stop > bus-stop.tar
# Or equivilantly
docker save --output bus-stop.tar bus-stop
```

Then loaded with

```
docker load < bus-stop.tar
# Or equivilantly
docker load --input bus-stop.tar
```

### Starting a container

Once the image has been build, we can run it in a container.

```
docker container run --publish 8000:80 --detach --name bus-stop bus-stop
```

`docker container run` is the command run a new container. `--publish
8000:80` forwards traffic from port 8000 to the Docker containers port 80.
`--detach` forks the process so it can run in the background. `--name` name's
the running container, without this the container gets a random name
generated by the Docker daemon.

Opening [http://localhost:8000/](http://localhost:8000/) you should see the
web app which is being served by Nginx.

In addition to starting this container, it has also been added to the list of
containers managed by your instance of Docker.

You can view all instances with

```
repos/bus-stop$ docker container ls --all
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS                          PORTS                      NAMES
fcab388de37b        bus-stop            "nginx -g 'daemon of…"   About a minute ago   Exited (0) About a minute ago                              bus-stop
15d251abc371        alpine/socat        "socat tcp-listen:23…"   26 hours ago         Up 9 hours                      127.0.0.1:2375->2375/tcp   exciting_cerf
```

To stop the container you can use

```
docker container stop bus-stop
```

And to remove the container

```
docker container rm bus-stop
```
