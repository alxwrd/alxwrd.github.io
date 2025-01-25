import fs from "node:fs/promises";
import path from "path";

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

const cacheDirectory = "/tmp/alxwrd.co.uk/build_cache";

async function load<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "alxwrd",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function loadWithCache<T>(url: string): Promise<T> {
  const cacheFile = `${cacheDirectory}/${path.basename(new URL(url).pathname)}`;

  if (import.meta.env.PROD) {
    return await load(url);
  }

  try {
    const cacheContent = (await fs.readFile(cacheFile)).toString();
    console.log(`using cache for ${url}`);
    return JSON.parse(cacheContent);
  } catch (err) {
    console.error("no cache found");
  }

  const response = await load(url);

  fs.mkdir(cacheDirectory, { recursive: true }).then(() => {
    fs.writeFile(`${cacheFile}`, JSON.stringify(response));
  });
  return response as T;
}

export async function getProjects(): Promise<Project[]> {
  const projects = await loadWithCache<Project[]>(
    "https://api.github.com/users/alxwrd/repos?per_page=100"
  );

  projects.push(
    await loadWithCache<Project>(
      "https://api.github.com/repos/textstat/textstat"
    ),
    await loadWithCache<Project>(
      "https://api.github.com/repos/trailassociation-uk/trailassociation.uk"
    )
  );

  return projects
    .filter((p) => !p.fork && !p.archived && !p.disabled)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
}
