---
title: "Advice I wish I had when I started programming"
date: 2024-02-17 16:00:00
tags: ["blog"]
author: "Alex Ward"
---

I started my current path into programming almost ten years ago, back in 2014.
Today, I've been programming professionally for almost 8 years! Before then, I
tried and failed several times to learn how to code.

This is a list of things I wish someone had told me when I had first started.

- [Go beyond tutorials](#go-beyond-tutorials)
- [Don't try to remember it all](#dont-try-to-remember-it-all)
- [Avoid copy and paste](#avoid-copy-and-paste)
- [Read code](#read-code)
- [Read documentation](#read-documentation)
- [Build something](#build-something)
- [Accept it's hard and unnatural](#accept-that-its-hard-and-unnatural)

# Go beyond tutorials

When you first start out learning to program, tutorials will be your best
friend. They will get you up and running with the basics - teaching you data
types and control flows. However, at some point you will hit a wall and
tutorials and lessons will stop providing you value and you will end up in
'tutorial hell'.

Tutorial hell is when you get stuck following tutorials because it's all you
know and you haven't yet tried to build something from scratch. It's easy to get
trapped here because it's comforting, you know at some point during the tutorial
you will get the answers to the problem. When you're working on a project on
your own, if you get stuck you have to set out to find the answers to the
problems you are solving. This is hard, but a skill that is vital to develop.

If you can be mindful of tutorial hell, you will be able to spot it so you can
break out to start [building something](#build-something).


# Don't try to remember it all

I constantly find myself looking up syntax I _should_ know, and that's ok. It's
very easy to think that programmers commit to memory every single aspect of a
programming language. Instead, it's the opposite. We commit to memory the flow
of a program, `if`s and `for` loops, and anything else we happen to remember is
a bonus!

If you need to stop to look up what method you need to call in order to add an
element to your list - it's ok the first time, and it's ok the thousandth time.
Over time you will naturally start to remember the things that are important
for you to remember.

Don't let not knowing every aspect of programming stop you from starting to
build things.

<p class="text-neutral-700 lg:text-neutral-300 lg:hover:text-neutral-700 lg:transition-colors lg:duration-500">
One cavitate to this is if you're looking for your first job programming, and
some of your interviews involve pair programming - if you know you constantly
forget certain basics, take some time to commit them to memory.
</p>


# Avoid copy and paste

It can be very tempting to copy and paste a working solution from a tutorial
or [Stack Overflow](https://stackoverflow.com/) into your code editor. There
are a couple of reasons why you should avoid doing so while you're learning.

Writing code is not like writing normal text. It uses all the same characters
but somehow it's so alien. We have funny looking brackets showing up all the
time (`[`, `]`, `{`, `}`). And, while we have normal looking keywords (`if`,
`continue`), some you probably aren't typing day-to-day (`yield`, `void`) - and
the rest are brain breaking (`def`, `func`, `struct`, `lambda`, `elif`). By
transcribing code instead of copy and pasting, you will improve your muscle
memory for these incantations which will help you when you're writing code from
your own brain.

Another reason to type your code out is it helps you slow down and ingest what
you're typing. When you first start out you will be _really_ slow typing the
code out, which will probably feel frustrating. If you can stick with it, you
will find you will develop an internal
[patter](https://www.merriam-webster.com/dictionary/patter) that will speed up
with time. I liken it to listening to a podcast above 1x speed. You can jump in
at 2x, but it will be easier if you go to 1.2x speed first and increase slowly
from there.


# Read code

When working on an established system most of your time will be spending
reading, not writing, code. So, it can be a good skill to practice while you're
still learning as it will help accelerate your learning. Seeing how other people
solved a problem can new tools to your tool belt.

For example, in Python, you might start out creating lists dynamically using a
`for` loop

```python
results = []

for item in thing:
    if item == ...:
        results.append(item)
```

Then one day you come across this <a id="list-comprehension"></a>

```python
results = [item for item in thing if item == ...]
```

🤯

Modern programming is so fortunate to have a movement like open-source that
enables you to go and look at what other people are building/have built - and
take a look under the hood at how it was built.

When you're first getting started, it might be difficult to find good open
source code bases to read through - some code bases are complex and can quickly
get overwhelming if you try and understand them too quickly.

Be on the lookout for code reading opportunities, so when you do stumble upon
some code, you can stop and read it. Try and understand it. Did you understand
it quickly? Did anything surprise you? Was there something new you learnt?


# Read documentation

When I first starting programming and saw advice like 'read the documentation',
I always assumed it meant I would sit down with a cup of coffee and read it like
a book - going through each page until I had absorbed all there was to know
about the technology I was learning about. Don't be me.

Reading documentation is about using the documentation to answer a question you
have about a programming language or a technology. It's a vital skill to have -
I've [answered questions on
Stack Overflow](https://stackoverflow.com/questions/43941015#43941418)
before, not because I knew the answer, but because I found the answer in the
documentation.

If you can practice getting answers from the documentation rather that from
articles and help sites - you will be able to get yourself unstuck when [you're
on the path less trodden](https://xkcd.com/979/) and there are fewer questions
and answers available on the internet.


# Build something

I think as soon as you have a few basics under your belt you should try to
start solving problems. It will help you in two ways:

1. It will help the code you write feel less abstract - it will start doing real
things that help you.
2. When you learn of new data types or features of a language, your will make the
leap back to your project, thinking of ways this new thing can help you.

Without these two things, learning something new feels pointless. Why spend time
learning about a [hashmap/dictionary](https://en.wikipedia.org/wiki/Hash_table)
when it feels useless because you have no need for it.

Building something to solve a problem you have also exposes you to things that
can be a little bit more complicated, like reading and writing a file, or making
a web request. Doing these things in the context of trying to solve a problem
you have can make them a bit more bearable to learn.

So, try and think of a problem you have - either and home or at work. Could you
write a small program to solve it? 


# Accept that it's hard and unnatural

Programming isn't a thing humans brains were made to do. Occasionally, there
will be find someone who's mental model perfectly aligns with code and they hit
the ground running. However, for most of us it's strange and makes our head meat
hurt.

Accepting this can help alleviate some of the frustration that arises when you
encounter a new and challenging concept. Sometimes if you're just not
understanding something, take a couple of days, then revisit the topic. The rest
will help your mind absorb the information and when you come back to it, it
should be easier!

Sometimes, this isn't the case. For these times I would look to see if you
really need to understand the concept deeply right now. Do you need to know the
concept right now, or can you leave it and pick it up another time? (This is
tough for tutorials where you can't progress - maybe you're in [tutorial
hell](#go-beyond-tutorials)). Can you accept that this is how it works, even if
you don't fully understand it? Once your knowledge broadens, it might suddenly
click.
