# Commit Journey

A scroll-driven 3D git-history portfolio for **Parth Dagia** (@parthdagia05).
The visitor scrolls through a living commit graph: the camera flies down a glowing
commit trunk, branches split and merge at each featured project, a contribution
"skyline" rotates, stats count up, and the final HEAD node opens a playful
"open a PR" contact.

Built as a single self-contained page using **Three.js** (3D), **GSAP + ScrollTrigger**
(scroll timeline), and **Lenis** (smooth scroll), loaded from CDNs.

## Files

- `index.html` — the entire experience (markup + 3D scene + scroll logic).
- `support.js` — the small runtime the page depends on. **Must stay in the same folder.**

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
| 5 | exlang — JIT compiler for integer expressions | C++17, LLVM, ORC JIT |
| 6 | schemago — PostgreSQL migration runner | Go, PostgreSQL, Docker |

## Editing content

Project copy (names, descriptions, stack chips, links, stats) lives in the markup
of `index.html`, in the `<!-- 03 · PROJECTS -->` section — one `<article class="cj-project">`
per 100vh slab, alternating `justify-content` left/right.

The 3D merge-node placement is **auto-aligned** to where each project panel sits in
the scroll — no coordinate tweaking needed when you edit copy. If you add or remove a
project, keep three things in sync:

1. the number of `.cj-project` articles and their `top:Nvh` offsets,
2. the section's `min-height` (100vh per project),
3. the `PORTFOLIO.projects` array in the script — it supplies each node's hover
   label and which side (`-1` / `+1`) its branch bows to.

The camera-path and scroll-sync logic is commented in the script.

## Logo

The mark (a commit node on the trunk with a branch merging back in) is inline SVG —
used both as the nav badge and, URL-encoded, as the `data:` favicon in `<head>`.
