
export interface Project {
    name: string;
    full_name: string;
    html_url: string;
    description: string;
    stargazers_count: number;
    watchers_count: number;
    language: string;
    topics: string[];
}


export async function getProjects(): Promise<Project[]> {
    const projects: Array<any> = (
        await fetch(
            "https://api.github.com/users/alxwrd/repos?sort=pushed&per_page=100", {
            headers: {
                "User-Agent": "alxwrd",
            },
        }
        ).then((res) => res.json())
    ).filter((p) => !p.fork);

    return projects;
}


export async function parsePost() {

}
