# Commit Journey

A scroll-driven 3D git-history portfolio for **Parth Dagia** (@parthdagia05).
The visitor scrolls through a living commit graph: the camera flies down a glowing
commit trunk, branches split and merge at each featured project, a contribution
"skyline" rotates, stats count up, and the final HEAD node opens a playful
"open a PR" contact.

Built as a single self-contained page using **Three.js** (3D), **GSAP + ScrollTrigger**
(scroll timeline), and **Lenis** (smooth scroll), loaded from CDNs.

## Files

- `Commit Journey.dc.html` — the entire experience (markup + 3D scene + scroll logic).
- `support.js` — the small runtime the page depends on. **Must stay in the same folder.**

## Run it

This page loads its 3D libraries from a CDN, so it needs an internet connection.

**Hosted (recommended):** push to GitHub and enable GitHub Pages, or deploy to
Vercel/Netlify. It will run exactly as designed.

**Locally:** serve the folder (don't just double-click, some browsers block
ES-module imports over `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/Commit%20Journey.dc.html
```

## Push to your own GitHub repo

```bash
# from inside this unzipped folder
git init
git add .
git commit -m "Commit Journey — 3D portfolio"
# create an EMPTY private repo on github.com first, then:
git remote add origin https://github.com/parthdagia05/commit-journey.git
git branch -M main
git push -u origin main
```

(Or use github.com → "Add file" → "Upload files" and drag both files in.)

## Editing content

Project data (names, descriptions, stack chips, links, stats) lives in the markup
of `Commit Journey.dc.html`. The 3D merge-node placement is auto-aligned to where
each project panel sits in the scroll — no coordinate tweaking needed when you
edit copy. The camera-path and scroll-sync logic is commented in the script.
