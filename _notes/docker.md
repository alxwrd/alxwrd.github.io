---
layout: default
---

# Docker

> Docker is a set of platform as a service products that use OS-level
> virtualization to deliver software in packages called containers.
> Containers are isolated from one another and bundle their own
> software, libraries and configuration files


## WSL

By default, the `PATH` in [[WSL]] includes the Windows `PATH`. After
Docker Desktop for Windows is installed, it will include shell scripts
alongside the Windows binaries. This means that running `docker` in WSL,
will find the `docker` script in `/mnt/c/Program Files/Docker/Docker/resources/bin`.
This script just prints out a message about setting up Docker using WSL2.

To install Docker for Windows and use it from WSL, you can just run the
Windows Docker binary from WSL.

```batch
del /f "C:\Program Files\Docker\Docker\resources\bin\docker-compose"
del /f "C:\Program Files\Docker\Docker\resources\docker"

mklink "C:\Program Files\Docker\Docker\resources\bin\docker-compose" "C:\Program Files\Docker\Docker\resources\bin\docker-compose.exe"
mklink "C:\Program Files\Docker\Docker\resources\docker" "C:\Program Files\Docker\Docker\resources\docker.exe"
```