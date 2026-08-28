# Syed Safee — Portfolio

A black-and-blue, sci-fi-styled portfolio built with plain HTML/CSS/JS + Three.js.
No build step, no framework — works directly on GitHub Pages. Content is pulled
from your résumé (Azure Cloud Engineer, Kiya.ai / LTIMindtree / Jetto Technologies).

## 1. Add your photo
Drop a photo at:
```
assets/portrait.jpg
```
Portrait/vertical (3:4) crop works best. Until you add it, the hero shows a
placeholder frame telling you where to put it. Your résumé (`assets/resume.pdf`)
is already in place and wired to the "Download CV" button in the nav and About section.

## 2. Preview it correctly (important)
This site uses ES module JavaScript (`<script type="module">`) for the 3D scene.
**Browsers block modules when you open a file directly** (double-clicking
`index.html`, i.e. a `file:///...` URL) — so you must preview it through a local
server, not by opening the file:

- **VS Code**: install the "Live Server" extension → right-click `index.html` →
  "Open with Live Server".
- **Or, from a terminal in this folder**:
  ```bash
  python3 -m http.server 8000
  ```
  then open `http://localhost:8000` in your browser.

This is only a local-preview requirement — once deployed to GitHub Pages
(step 4 below), it works for every visitor automatically, since Pages always
serves over `https://`.

## 3. Personalize further
Everything is plain text in `index.html`:

- **Hero** (`#hero`): name, role, tagline, stats.
- **About** (`#about`): the two paragraphs, four discipline cards.
- **Skills** (`#skills`): the orbit nodes — edit label text on `.orbit-node`
  divs, or add/remove entries. `data-ring` is 1/2/3 (inner → outer),
  `data-angle` is degrees (0–360).
- **Work** (`#work`): your three project write-ups and stack tags.
- **Path** (`#experience`): the employment timeline.
- **Credentials** (`#credentials`): certifications, education, languages.
- **Contact** (`#contact`): email, phone, LinkedIn.

## 4. Deploy to GitHub Pages
1. Create a repo (e.g. `yourname.github.io` for a root-domain site, or any name
   for a project site).
2. Push these files to the repo root:
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Source → Deploy from a branch → `main` / `/(root)`**.
4. Live at `https://<you>.github.io/` (repo named `<you>.github.io`) or
   `https://<you>.github.io/<repo>/` (any other repo name).

## What's interactive
- **Scroll-linked 3D**: the hero's wireframe "Signal Core" rotates and the
  camera pulls back as you scroll past the hero — an Apple-style scroll
  reveal, built with a simple lerp against scroll position (no extra library).
- **Parallax**: hero text and portrait drift and fade as you scroll away.
- **Scroll-tilt**: the glyph icons on each Work card rotate based on their
  position in the viewport.
- Hover tilt on glass cards, a custom cursor (desktop only), scroll-reveal
  fade-ins, and a responsive slide-out menu on mobile.
- Respects `prefers-reduced-motion` — all of the above is disabled for users
  who request it at the OS level.

## Structure
```
index.html           all page content/sections
css/style.css         design system — tokens at the top of the file
js/three-scene.js     the "Signal Core" 3D hero background (Three.js)
js/main.js            loader, scroll-driven animation, cursor, nav, reveals
assets/portrait.jpg   ← add your photo here
assets/resume.pdf     your résumé, linked from the "Download CV" button
```

Palette, fonts, and spacing are CSS custom properties at the top of
`css/style.css` under `:root` — change them there to retheme the whole site.
