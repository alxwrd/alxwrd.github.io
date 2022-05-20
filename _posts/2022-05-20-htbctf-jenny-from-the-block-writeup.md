---
layout: post
title:  "HTB CTF - Jenny From The Block writeup"
date:   2022-05-20 08:30:00
tags: ["ctf-writeup"]
author: "Alex Ward"
---

On a first pass, this challenge completely stumped me. I have very
little experience with cryto algorithms, so I didn't even know where to begin.

Looking at the main encryption logic, I decided it best to just
searched some code.

```python
def encrypt_block(block, secret):
    enc_block = b''
    for i in range(BLOCK_SIZE):
        val = (block[i]+secret[i]) % 256
        enc_block += bytes([val])
    return enc_block
```

<!-- more -->

Searching the web for "`(block[i]+secret[i]) % 256`" lead me to
the Wikipedia page [RC4](https://en.wikipedia.org/wiki/RC4)!

> multiple vulnerabilities have been discovered in RC4, rendering it insecure.

I started searching for vulnerabilities and learnt that a repeated
secret can be used to crack the secret. In this case it doesn't help much because a new secret is generated every time.

```python
password = os.urandom(32)
ct = encrypt(response, password)
req.sendall(ct.encode())
```

I'd almost given up when I saw a mention to trying to get the key by
"guessing the plain text input", and realised we do have access to the plain input.

Each "response" is returned not just as the result of the command,
but wrapped with `f"Command executed: {command} \n{output}"`. _"Command executed: "_ is known data.

The response isn't just ecrypted all in one go, it's broken up into
32 byte chucks, the first is encrypted with random bytes, but the rest are encrypted with the contents of the previous block.

```python
for block in blocks:
    enc_block = encrypt_block(block, h)
    h = sha256(enc_block + block).digest()
    ct += enc_block
```

This is when I noticed the command to get the flag wasn't `cat flag.txt`,
it was `cat secret.txt`. Why `secret.txt`? It's exactly 32 bytes!

```python
>>> len("Command executed: cat secret.txt")
32
```

This lead me down a rabbit hole of searching for a way to get the
secret out from the encrypted block. I read that RC4 XOR's a keystream
onto the plaintext input, and that it was reverseable?

I started randomly XORing things together in the hope that something
would pop out, but then I realised that nothing in the challenge
code was doing an XOR...

Re-reading the encryption method:

```python
val = (block[i] + secret[i]) % 256
```

can be reversed by

```python
secret[i] = (block[i] - val)  # (+ 256 if negative)
```

The solve was now just writing the code to reverse the first
secret, and then traversing the block chain.

```python
from hashlib import sha256

KNOWN_INPUT = b"Command executed: cat secret.txt"

encrypted_bytes_string = bytes.fromhex(
    "93f4c05e243eab634a9eba32856b85fd5b058db57cf9400a335a76e8d6df46f97a03c9e9038815f1f713869a83c7369cd45e732621afb5c865fb814890429bb2"
)


def split_by_n(seq, n):
    while seq:
        yield seq[:n]
        seq = seq[n:]


def reverse_block(block, secret_or_input) -> bytes:
    """
    Takes an ecrypted block and either the secret or known input.

    If the secret is provided, it will return the unencrypted data.
    If known input is provided, it will return the secret used to encrypt the data
    """
    dec_block = b""
    for i in range(32):
        val = block[i] - secret_or_input[i]
        if val < 0:
            val += 256
        dec_block += bytes([val])
    return dec_block


def decrypt_message(message):
    blocks = list(split_by_n(message, 32))

    secret = reverse_block(blocks[0], KNOWN_INPUT)

    message = b""
    for block in blocks:
        decrypted_block = reverse_block(block, secret)

        secret = sha256(block + decrypted_block).digest()
        message += decrypted_block
    return message


if __name__ == "__main__":
    print(decrypt_message(encrypted_bytes_string))

# HTB{b451c_b10ck_c1ph3r_15_w34k!!!}
```