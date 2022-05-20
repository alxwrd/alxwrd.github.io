---
layout: post
title:  "HTB CTF - The Three-Eyed Oracle writeup"
date:   2022-05-20 08:40:00
tags: ["ctf-writeup"]
author: "Alex Ward"
---

This post is the hero of this solve ->
[https://zachgrace.com/posts/attacking-ecb/](https://zachgrace.com/posts/attacking-ecb/)

![](https://i.postimg.cc/8PJzk5Y9/the-three-eyed-oracle.gif)

_I love challenges like these, where the flag slowly falls out_

<!-- more -->

```python

import socket

HOST, PORT = "134.209.22.191:31033".split(":")


def split_by_n(seq, n):
    """A generator to divide a sequence into chunks of n units."""
    while seq:
        yield seq[:n]
        seq = seq[n:]


def recieve(sock: socket.socket):
    data = b""
    while b">" not in data:
        res = sock.recv(512)
        data += res
    return data


def get_blocks_from_remote(payload: str, sock: socket.socket, padding = 4):
    sock.sendall(
        bytes(
            bytes("b" * padding, "utf-8").hex() + bytes(payload, "utf-8").hex(),
        "utf-8")
    )

    received = str(recieve(sock), "utf-8")

    if not received.endswith("> "):
        received += str(recieve(sock), "utf-8")

    return list(split_by_n(received, 32))


with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.connect((HOST, int(PORT)))
    intro = recieve(sock)

    count = 16 * 3
    
    result_string = ""

    while True:
        count -= 1
        payload = "a" * (count)

        block = get_blocks_from_remote(payload, sock)[3]

        for i in range(32, 126):
            result_block = get_blocks_from_remote(payload + result_string + chr(i), sock)[3]
            if result_block == block:
                result_string += chr(i)
                break
        print(result_string)

```