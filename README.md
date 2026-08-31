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

The camera-path and scroll-sync logic is commented in the script.

## Logo

The mark (a commit node on the trunk with a branch merging back in) is inline SVG,
used both as the nav badge and, URL-encoded, as the `data:` favicon in `<head>`.
