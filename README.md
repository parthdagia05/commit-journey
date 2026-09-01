# Commit Journey

A scroll-driven 3D git-history portfolio for **Parth Dagia** (@parthdagia05).
The visitor scrolls through a living commit graph: the camera flies down a glowing
commit trunk, branches split and merge at each featured project, a contribution
"skyline" rotates, stats count up, and the final HEAD node opens a playful
"open a PR" contact.

Built as a single self-contained page using **Three.js** (3D), **GSAP + ScrollTrigger**
(scroll timeline), and **Lenis** (smooth scroll), loaded from CDNs.

## Files

- `index.html`: the entire experience (markup + 3D scene + scroll logic).
- `support.js`: the small runtime the page depends on. **Must stay in the same folder.**
- `data/github.json`: the real contribution calendar and merged-PR counts, regenerated daily by CI.
- `scripts/fetch-github-data.mjs`: builds that file.
- `.github/workflows/refresh-github-data.yml`: runs the script on a daily cron.

## Run it

This page loads its 3D libraries from a CDN, so it needs an internet connection.

**Hosted (recommended):** push to GitHub and enable GitHub Pages, or deploy to
Vercel/Netlify. It will run exactly as designed.

**Locally:** serve the folder (don't just double-click, some browsers block
ES-module imports over `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## The commit rail

A minimap of the graph pinned to the right edge. Each dot sits at the scroll
position of the thing it points at, so the rail is a scale drawing of the page
rather than an evenly spaced menu: the six merge points really do cluster in the
middle third. The line fills as you scroll, the nearest dot lights up, and the
nav's `git:(branch)` readout follows it, so passing a merge point checks out
that branch.

Click any dot to jump. <kbd>j</kbd> and <kbd>k</kbd> step to the next and
previous merge point.

The rail shares `consoleTargets()` and `scrollToY()` with the console, so the
two can never disagree about where a commit is, and it rebuilds itself on resize
and on `load`. It is hidden below 860px, where there is no room for it.

One wrinkle worth knowing if you touch `stepCommit`: a rail jump is animated, so
during one the page sits between two stops and the nearest-dot tracker lags.
Stepping off it would make a quick j-j-j land one commit down instead of three,
so while a jump is in flight the next step counts from the stop that was asked
for. A wheel or touch cancels that, because at the point the visitor takes over
the scroll, where they are beats where we were heading.

## The git console

Press <kbd>⌘K</kbd> (<kbd>Ctrl</kbd>+<kbd>K</kbd>) or <kbd>/</kbd> and the page grows a
working command line. It is the site's own navigation, not a gag:

| Command | What it does |
|---|---|
| `git log` | the merge points as an oneline graph; every hash is clickable |
| `git checkout <ref>` | flies the camera to that commit. Takes a branch, a hash, a project name, `1`-`6`, or `head` |
| `git show <ref>` | that commit's stack, summary and upstream link |
| `git status` | which section you are on and how far through the history |
| `git branch`, `git remote -v`, `whoami` | the branch list, the links, the bio |
| `git push --force` | not a navigation command |

Tab completes commands and refs, <kbd>↑</kbd>/<kbd>↓</kbd> walks history, <kbd>esc</kbd> closes.

Every command reads its data back out of the project markup, so there is no second
copy of the content to keep in sync: edit a slab and the console follows. The console
is plain DOM and boots before Three.js, so the page stays navigable by keyboard even
if the 3D never loads, and the flourishes a command triggers (a bloom surge, a camera
shake) are skipped when there is no scene and under `prefers-reduced-motion`.

## Content

The six merge points are, in scroll order:

| # | Node | Stack |
|---|------|-------|
| 1 | Music Blocks 4 · Sugar Labs (GSoC 2026, maintainer) | TypeScript, React, SVG |
| 2 | Kubescape (CNCF) | Go, Kubernetes, CEL |
| 3 | WasmEdge (CNCF) | C++17, CMake, WebAssembly |
| 4 | Hyperledger Besu | Java, JMH, Gradle |
| 5 | exlang, a JIT compiler for integer expressions | C++17, LLVM, ORC JIT |
| 6 | schemago, a PostgreSQL migration runner | Go, PostgreSQL, Docker |

## Live data

The skyline and the counters are not decoration: every bar is a real day and
every number comes from the GitHub API.

`scripts/fetch-github-data.mjs` pulls two things and writes `data/github.json`:

- the contribution calendar (GraphQL, stored as a start date plus a flat run of
  daily counts, so 367 days cost one array instead of 367 date strings), and
- merged pull requests (REST search), grouped by repo and by owner. Repos owned
  by the profile itself are excluded from the "upstream" totals.

The PR query is pinned to `is:public`, because a personal token also sees merged
PRs in your own private repos while CI's `GITHUB_TOKEN` does not; without the
pin, a local run and a CI run disagree and the committed file flip-flops. The
contribution calendar total is the one figure that still moves with the token
(the owner's own token counts private contributions), so CI is the source of
truth for it.

A daily workflow re-runs it and commits the file if it changed, so the page
stays a plain static site with no token in the browser. To refresh by hand:

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/fetch-github-data.mjs
```

The workflow prefers a `GH_PAT` secret and falls back to the built-in
`GITHUB_TOKEN`. Add a `GH_PAT` (classic, `read:user`) only if the run reports
that it could not read the contribution calendar; the PR search works with
either.

In the markup, `data-gh="prs.merged"` is a dot path into that JSON. On a
`.cj-counter` the value becomes the count-up target; anywhere else it is
written straight in, with an optional `data-gh-suffix`. If the fetch fails,
including over `file://`, every bound element keeps the literal value in the
HTML and the skyline falls back to its synthetic pattern, so the page never
renders empty.

## Editing content

Project copy (names, descriptions, stack chips, links, stats) lives in the markup
of `index.html`, in the `<!-- 03 · PROJECTS -->` section: one `<article class="cj-project">`
per 100vh slab, alternating `justify-content` left/right.

The 3D merge-node placement is **auto-aligned** to where each project panel sits in
the scroll, so no coordinate tweaking is needed when you edit copy. If you add or remove a
project, keep three things in sync:

1. the number of `.cj-project` articles and their `top:Nvh` offsets,
2. the section's `min-height` (100vh per project),
3. the `PORTFOLIO.projects` array in the script, which supplies each node's hover
   label and which side (`-1` / `+1`) its branch bows to.

The git console needs no update: it re-reads the slabs on every command, picking up
each one's heading, hash, branch, stack chips and upstream link from the markup.

The camera-path and scroll-sync logic is commented in the script.

## Logo

The mark (a commit node on the trunk with a branch merging back in) is inline SVG,
used both as the nav badge and, URL-encoded, as the `data:` favicon in `<head>`.
