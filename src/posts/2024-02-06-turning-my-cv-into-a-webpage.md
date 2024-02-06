---
title: "Turning my CV into a webpage"
date: 2024-02-06 21:00:00
tags: ["blog"]
author: "Alex Ward"
---

Recently, I found myself in a position where I needed to update my CV. After
some initial content edits I decided I wanted to tweak the layout.

I fought with invisible tables with white borders. I tried to keep images the
same size by eye. I aligned paragraphs by holding a ruler to the screen.

***The process was frustrating.***

I have never liked a plain CV, and maintaining something visually appealing in a
word processor was starting to become a hair-pulling experience.

So I turned to what I know best: code.

I felt that I could be more consistent and iterate faster using HTML and CSS.


## Site framework

I have [recently](
https://github.com/alxwrd/alxwrd.github.io/commit/03cac7e09a7c6e866f903bf971e377f248f9fa28)
migrated my personal site away from [Jekyll](https://jekyllrb.com/) to
[Astro](https://astro.build/) and enjoyed the experience.

I decided to stick with Astro for this project because of the ability to
generate a static site and the fact that it was component-based in a similar
style to Svelte, which is my goto frontend framework. I've grown to love being
able to write plain HTML when writing components.

Getting started was super easy.

```shell
pnpm create astro@latest
cd ./curriculum-vitae
```

## Styling with Tailwind CSS

To style my page, I used [Tailwind CSS](https://tailwindcss.com/), a
utility-first CSS framework.

If you haven't tried Tailwind yet, I highly recommend it. Something about
styling a page inline, with simple utility classes, just clicks nice with my
brain and I think I would struggle to go back to plain CSS.

I enjoy how the constraints of the framework make it really easy to make good
decisions. I don't need to pick arbitrary values like `14px` and can just use
`text-sm`.

Adam Watham, the creator of Tailwind, has a [blog
post](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/)
that beautifully runs through why semantic CSS is hard to maintain.

Setting this up was also super easy.

```shell
pnpm astro add tailwind
```


## Printable page

One disadvantage of a webpage CV is the inability to distribute it outside of
it's form factor. For example, sometimes it's necessary to attach a file to an
application form.

In vanilla CSS, there are `@media` and `@page` queries that allow you to control
the style of elements during printing. Tailwind conveniently lets you control
the style via the `print` modifier. It works the same way as `hover` and `focus`
and was so simple to use.

For everything that needed to be hidden during printing, it was just a case of
adding `print:hidden` as a class.

```html
<div class="print:hidden">
    ...
</div>
```

Having a printable page also meant I could now easily produce a PDF using print
to PDF.


## Github pipelines

Once the site was finished, it was time to publish it to the web! I publish to
Github pages quite a lot because it's free.
[For](https://alxwrd.co.uk/school-timer/) [Ex](https://alxwrd.co.uk/bus-stop/)
[am](https://alxwrd.co.uk/mausgrid/) [ple](https://alxwrd.co.uk/hiveman/)

Astro provides [`withastro/action`](https://github.com/withastro/action) that
plays nicely with the Github
[`actions/deploy-pages`](https://github.com/actions/deploy-pages). The complete
build and deploy jobs are basically:

```yaml
jobs:
  build:
    ...
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v1

  deploy:
    ...
    steps:
      - uses: actions/deploy-pages@v3
```

With the site being automatically deployed, I had the idea to also use pipelines
to produce a PDF with my first thought to investigate setting something up using
[Puppeteer](https://pptr.dev/api/puppeteer.page.pdf).

However, I managed to stop myself and take a step back. This was supposed to be
a project I could turn around pretty quickly. It was getting towards the end of
the day, and so I wanted to wrap up quickly. I knew someone must have already
created an action to produce a PDF, so after a quick search I came across
[`misaelnieto/web_to_pdf_action`](https://github.com/misaelnieto/web_to_pdf_action).

I didn't get to invent my own wheel, but I did get to provide value to myself faster.

## Conclusion

Overall, I managed to migrate my CV to a webpage in less than a day, and it has
been a game-changer.

For me, it is now so much easier to make design changes - and I don't need to
fight with a word processor anymore.


Going forward I am excited to add some more interactive elements, and
potentially some easter eggs 🪺.
