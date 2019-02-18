---
layout: post
title:  "Locating a git commit id from untracked source files."
date:   2019-02-17 22:00:00
tags: ["blog", "git"]
author: "Alex Ward"
---

![](https://i.imgur.com/MzX4VjD.png)

>  _This is an expansion on [How can I find a commit that most closely matches a directory?](https://stackoverflow.com/questions/6388283/git-how-can-i-find-a-commit-that-most-closely-matches-a-directory)_

The situation is as follows: you have a set of source files that are untracked and you want to locate at what point in your git tree they came from.

You know they _should_ match a commit id in your repository (or as close as you can get), but you're not sure _where_. These files might also have had untracked changes done to them since.

# Setting up

First thing we want to do is create a new local repository. This repository will contain the untracked code, and serve as an easy way to reference it from within git.

```shell
$ mkdir untracked-source && cd untracked-source
$ git init
```

Next we'll want to copy all the code we have available into this new directory.

It is important to match the same layout as the current repository!

For example, if we have untracked code in a `project/` folder but our source repository is laid out as `src/project/`, we should make a `src/` directory in the new repository.

```plain
my-project/              untracked-source/   ✔ Good
└── src/                 └── src/
    └── project/             └── project/
        └── <files>              └── <files>


my-project/              untracked-source/   ❌ Bad
└── src/                 └── project/
    └── project/             └── <files>
        └── <files>
```

Don't worry about missing files in this new repository. For example, if we have a `README` in your main repository, it's possible that is doesn't exist in the untracked source we have.

Don't copy files to our new repository, just leave them missing.


```plain
my-project/                      untracked-source/
├── README.md                    ├── ❌ dont copy
└── src/                         └── src/
    └── project/                     └── project/
        └── <files>                      └── <files>
```

We want only the files you have; in the correct folder layout.

Finally, we'll want to commit all these files.

```shell
$ git add .
$ git commit -m "initial commit"
```

Don't worry too much about this repository, it's only use is to help us find the commit id in the real repository.

# Searching

Now we can change back to our main repository, then add and fetch the new repository. 

```shell
$ cd ../my-project
$ git remote add untracked ../untracked-source
$ git fetch untracked
```

git will show a message like _"no commits in common"_ when fetching the repository. That's OK.

We can now walk our commit history and perform diffs against our untracked code. For this, we want to:

- Get each commit id matching some criteria.
- Perform a diff from our 'untracked' repository against each commit.
- Output the commit date, differences, and commit id to both a file and stdout.

We can use the following bash script, which we'll go over.

```bash
for revision in $(git rev-list <filter>); do
  short_diff=$(git diff untracked/master "$revision" --shortstat --diff-filter=M <other filters>)
  commit_date=$(git show --no-patch --format=%ci "$revision")
  echo $commit_date, $short_diff, $revision | tee -a ~/rev-diff.txt;
done;
```


## Breaking it down

### `git rev-list` filters 

If we have no idea where in the source tree the untracked source came from, the only real option is to use `--all` and walk through every commit in our repository. Even an guesstimate can help shorten this process though.

For all filters available, run `git rev-list` with no options, or visit the [git docs](https://git-scm.com/docs/git-rev-list).

#### Time

We can use `--after=yyyy-mm-dd --until=yyyy-mm-dd` if there is a period when the untracked source might have been produced.

#### Versions

If we know it exists from before or after a commit id, or tag, in the git tree, we can use `<commit id>..<commit id>` or `<tag>..<tag>`.

#### Parents

When generating a revision list, we might only want to stick to the 'main line', and not traverse branches that have been merged. For this, use `--first-parent `. 

![](https://i.imgur.com/E3nqXuc.png)

### `git diff` filters

We don't want all the information `git diff` would give us. 

First, we want to use `--shortstat` to hide the actual line changes, and only output the summary of the diff.

```plain
10 files changed, 423 insertions(+), 832 deletions(-), d6cd1e2bd19e03a81132a23b2025920577f84e37
```

Second, the untracked source might be missing files, or have white space changes. But, because we only want substantial code changes, these changes need to be filtered. For source control we would want to track these changes. But, for the purposes of locating which commit id our untracked files came from, this is noise.

Finally, we need to use the filter `--diff-filter=M` to only show _modifications_ to files. This is why it doesn't matter if our README file is missing from the untracked source.

Ignoring whitespace changes might also be useful, the some of the options are

`--ignore-space-at-eol`, `--ignore-cr-at-eol`, `--ignore-space-change`, `--ignore-all-space `, `--ignore-blank-lines` , and `--allow-indentation-change`.

More can be found by browsing the [git-diff docs](https://git-scm.com/docs/git-diff).

## Running the search

Once our bash script has been crafted, it's time to run it!

Depending on how large your repository history is, this might take a while. Large repositories with lots of files and changes will take longer than small repositories with a few files and changes.

That's the reason we want to pipe our output to tee: `| tee -a ~/rev-diff.txt;`. This allows us to watch the results, but also means they're saved to a file if it's taking a long time and we go for a coffee!

When we run our script, the output will look something like:

```plain
yyyy-mm-dd hh:mm:ss +0000, 10 files changed, 423 insertions(+), 832 deletions(-), d6cd1e2bd19e03a81132a23b2025920577f84e37
yyyy-mm-dd hh:mm:ss +0000, 9 files changed, 354 insertions(+), 753 deletions(-), d6cd1e2bd19e03a81132a23b2025920577f84e37
... etc
```


# Parsing the results

Now we have the results in hand, we can begin our search.

With any luck, there should be an exact match. You can spot this because git won't output any diff information if there's no diff:

```plain
yyyy-mm-dd hh:mm:ss +0000, , d6cd1e2bd19e03a81132a23b2025920577f84e37
```

If this isn't the case, we are looking for the commit with the smallest change. The untracked source might have been edited.

Personally, I find browsing the `rev-diff.txt` file manually to be helpful and interesting. You might even notice the changes decreasing, then increasing again.

```plain
98 insertions(+), 68 deletions(-)
86 insertions(+), 54 deletions(-)
14 insertions(+), 32 deletions(-)
2 insertions(+), 4 deletions(-)
7 insertions(+), 19 deletions(-)
29 insertions(+), 23 deletions(-)
```

If there are too many diffs, we might opt to just sort them:

```shell
cat rev-diff.txt | grep -e '[0-9]* insertions' | sort -n | head -n 10
cat rev-diff.txt | grep -e '[0-9]* deletions' | sort -n | head -n 10
```

Once we've found something promising, we can do the diff ourselves to see what the differences are:

```shell
git diff untracked/master d6cd1e2bd19
```

If there are differences here that we don't care about (whitespace), we'll have to go tweak our diff filters and try again.

But hopefully we've found the commit your code came from!

![](https://i.imgur.com/ZF93sUv.png)

