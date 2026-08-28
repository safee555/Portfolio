# Syed Safee — Portfolio

A black-and-blue/gold sci-fi portfolio built with plain HTML/CSS/JS + Three.js.
No build step, no framework — works directly on GitHub Pages. Content is pulled
from your résumé and positioned as a multi-cloud Senior Cloud Engineer (AWS,
Azure, GCP).

## 1. Add your photo
Drop an unframed cutout/PNG at:
```
assets/portrait.png
```
A transparent-background PNG works best — it floats directly on the page with
a soft glow and gentle bob animation, no frame or box around it. Until you add
it, the hero shows a placeholder telling you where to put it.

## 2. Preview it correctly (important)
This site uses ES module JavaScript (`<script type="module">`) for the 3D
scenes. **Browsers block modules when you open a file directly**
(double-clicking `index.html`) — you must preview it through a local server:

- **VS Code**: install "Live Server" → right-click `index.html` → "Open with
  Live Server".
- **Or, from a terminal in this folder**:
  ```bash
  python3 -m http.server 8000
  ```
  then open `http://localhost:8000`.

This is only a local-preview requirement — GitHub Pages always serves over
`https://`, so it works for every visitor automatically once deployed.

## 3. What's new in this build
- **Tech orbit + networking globe** (`#skills`): a rotating wireframe globe
  with glowing arc connections sits at the center; your 13 real tool icons
  (only the ones you supplied — no text-only placeholders) orbit it in three
  rings. Positions are computed every frame as plain 2D transforms (never CSS
  `preserve-3d`), which is what keeps icons upright and correctly ordered on
  iOS Safari specifically — that browser has known bugs with nested 3D
  transforms that cause exactly the "flips upside down" issue you flagged.
- **Gold cursor spotlight**: a soft golden glow trails the pointer on desktop
  (disabled on touch/mobile automatically).
- **Floating hero photo**: no frame, no border, no box — just a bobbing PNG
  with a soft glow, positioned beside the hero text.
- **Header**: numbering removed, sliding underline on hover.
- **Multi-cloud positioning**: copy now frames you as a Senior Cloud Engineer
  across AWS/Azure/GCP rather than Azure-only (kept honest to your résumé —
  Azure/AWS are described as hands-on depth, GCP as working familiarity since
  that's what the icon set implies; adjust the About copy directly if you'd
  phrase your GCP experience differently).
- **Certification card**: now a real link to your Microsoft Learn credential,
  opens in a new tab.
- **Company logos**: Kiya.ai, LTIMindtree, and Jetto Technologies logos sit
  next to each role in the timeline.
- **Premium card hover**: project/about/credential cards tilt toward the
  cursor and pick up a blue-gold glow that follows pointer position.
- **Rare rocket accent**: a tiny, infrequent (~every 25–60s) cross-screen
  flourish, desktop-only, disabled under `prefers-reduced-motion`.
- All motion respects `prefers-reduced-motion`, and the tech-orbit animation
  loop pauses via `IntersectionObserver` when scrolled off-screen to save
  CPU/GPU.

## 4. Personalize further
Everything is plain text/markup in `index.html`:
- **Hero** (`#hero`): name, role, tagline, stats.
- **About** (`#about`): the two paragraphs, four discipline cards.
- **Stack** (`#skills`): icons live in `.orbit3d` — each `.orbit3d-icon` has
  a `data-ring="a|b|c"` (inner → outer) plus an `<img>` and `<span>` label.
  Add/remove/swap icons here; ring assignment and count auto-adjust in JS.
- **Work** (`#work`): your three project write-ups and stack tags.
- **Path** (`#experience`): the employment timeline and company logo chips.
- **Credentials** (`#credentials`): certification link, education, languages.
- **Contact** (`#contact`): email, phone, LinkedIn.

## 5. Deploy to GitHub Pages
1. Create a repo (e.g. `yourname.github.io` for a root-domain site, or any
   name for a project site).
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

## Structure
```
index.html            all page content/sections
css/style.css          design system — tokens (blue/gold/warm) at the top
js/three-scene.js      hero "Signal Core" 3D background (Three.js)
js/globe-scene.js      skills-section networking globe (Three.js)
js/main.js             loader, scroll animation, tech orbit, cursor, nav
assets/portrait.png    ← add your cutout photo here
assets/resume.pdf      your résumé, linked from "Download CV"
assets/icons/          the 13 technology logos you provided
assets/logos/          Kiya.ai, LTIMindtree, Jetto Technologies logos
```

Palette, fonts, and spacing are CSS custom properties at the top of
`css/style.css` under `:root` — change them there to retheme the whole site.
