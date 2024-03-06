
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
    fork: boolean;
    archived: boolean;
    disabled: boolean;
}


async function load<T>(url: string): Promise<T> {
    const response = await fetch(url,
        {
            headers: {
                "User-Agent": "alxwrd",
            },
        }
    )

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.json();
}


export async function getProjects(): Promise<Project[]> {

    const projects = await load<Project[]>("https://api.github.com/users/alxwrd/repos?per_page=100")

    projects.push(
        await load<Project>("https://api.github.com/repos/textstat/textstat"),
        await load<Project>("https://api.github.com/repos/trailassociation-uk/trailassociation.uk"),
    )

    return projects
        .filter((p) => !p.fork && !p.archived && !p.disabled)
        .sort((a, b) => b.stargazers_count - a.stargazers_count);
}
