
export interface Project {
    name: string;
    full_name: string;
    html_url: string;
    homepage: string;
    description: string;
    stargazers_count: number;
    watchers_count: number;
    language: string;
    topics: string[];
}


export async function getProjects(): Promise<Project[]> {
    const response = await fetch(
        "https://api.github.com/users/alxwrd/repos?sort=pushed&per_page=100",
        {
            headers: {
                "User-Agent": "alxwrd",
            },
        }
    )

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    const projects: Array<any> = (await response.json()).filter((p) => !p.fork);

    return projects;
}
