---
title: "Building tools with agents"
date: 2026-04-23 12:00:00
tags: ["ai"]
author: "Alex Ward"
---

I find there's a tension at the moment when building tooling to support your
day-to-day work as a software engineer. The tension arrises because coding
agents are extremely good at "one-shotting" prototypes (and I think a lot of
tooling need can be solved by protoypes) but after you have solved your problem,
what do you do with the tool you are left with?

As an example, I recently needed to understand some information that was stored
in a database. Instead of poking around the tables and trying to piece together
the information in my head, I got Claude Code to "vibe" up a web app that
displayed the records in a [way that was way more digestable][1].

However, once I've used my tool to understand the information at hand, do I
_keep the tool_? It was basically free and took basically no effort. If I have
this problem again, I can just vibe up something similar. In fact, I could
generate as many iterations on the intial idea as I want. How do I know this
version of the tool is the best version of the tool? And then how do I know that
next time I'm in this problem space that my needs for the tool aren't different
enough that keeping this version isn't over-fitting?

But, I decide to keep my tool and now a question bubbles up, should I _improve_
it? It solved my problem and I _could_ move on but... maybe the layout of this
bit of information could be made better, the way to invoke the tool doesn't have
great DX, and the contrast on this text makes it kinda hard to read. I'm now





[1]: https://www.youtube.com/watch?v=fdbXNWkpPMY&t=167s "A love letter to Pi | Lucas Meijer"
