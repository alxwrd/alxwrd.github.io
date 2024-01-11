import type { MarkdownInstance } from "astro";


type FrontMatter = {
    title: string;
    date: Date;
    localeDate: string;
    description: string;
    tags: string[];
    author: string;
}

export type Post = MarkdownInstance<FrontMatter> & {
    slug: string;
}


export function parsePost(post): Post {
    return {
        ...post,
        slug: post.file.split("/").pop().split(".").shift(),
        frontmatter: {
            ...post.frontmatter,
            date: new Date(post.frontmatter.date),
            localeDate: new Date(post.frontmatter.date).toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }
            )
        }
    }
}


export async function getPosts(): Promise<Post[]> {
    const posts = import.meta.glob("./*.md");

    return (await Promise.all(Object.keys(posts).map(async (key) => {
        return parsePost(await posts[key]())
    })))
        .sort(
            (a, b) => { return a.frontmatter.date > b.frontmatter.date ? -1 : 1 }
        )
}


export async function getRssItems() {
    const posts = await getPosts();

    return posts.map(post => {
        return {
            title: post.frontmatter.title,
            pubDate: post.frontmatter.date.toISOString(),
            description: post.frontmatter.description,
            link: `/blog/${post.slug}`,
        }
    }
    )
}
