# Syed Safee — Portfolio

Dark, cinematic, glow-accented portfolio with a real Three.js globe and
aligned orbital tech icons. Plain HTML/CSS/JS, no build step, no framework —
works directly on GitHub Pages.

## 1. Preview it
This uses ES modules for the 3D globe, so open it through a local server
(double-clicking `index.html` will show the page but the globe won't load):
```bash
python3 -m http.server 8000
```
then open `http://localhost:8000`.

## 2. What's in this build
- **Hero**: a real rotating wireframe globe (Three.js) with glowing network
  arcs and a particle halo, centered behind your name. Two orbital rings —
  drawn as SVG ellipses — carry your core cloud platforms (inner ring:
  Azure, AWS, GCP) and platform tooling (outer ring: Kubernetes, Docker,
  Terraform). Icon positions are computed every frame from the exact same
  ellipse math used to draw the visible ring lines, so they always sit
  precisely on the path — not floating randomly.
- **Header**: hides itself (slow, eased slide) as you scroll down, and
  reappears as soon as you scroll up — plus the usual blur/border once
  you've scrolled past the top.
- **Hover glow**: every card — About's spec cards, Work's project sheets,
  Path's experience records, the Stack marquee pills, and the Contact
  links — glows from behind, centered on your cursor position.
- **Scroll-exit dissolve**: as each section scrolls up and out of view, it
  fades, lifts, and scales down together rather than just cutting off.
- **Cinematic type**: Michroma for headlines (hero name, section titles),
  Space Grotesk for body copy, JetBrains Mono for data/labels.
- **Work section imagery**: each project card has a real photo banner,
  sourced from free-license Unsplash photos (data center racks, network
  cabling) matched to that project's theme.
- **Cursor torch**: a large, soft glow follows the pointer on desktop.
- Animated stat counters, magnetic buttons, a mobile slide-out nav, and an
  intro curtain reveal on load. Respects `prefers-reduced-motion` throughout.
- No photo in the hero yet, per your instruction — add one later and I can
  wire it back in.

## 3. About the Work section photos
The three images are hotlinked directly from Unsplash under the free
[Unsplash License](https://unsplash.com/license) (free for commercial use,
no attribution required). If you'd rather not depend on an external host
long-term, download them and place them in `assets/work/`, then update the
`<img src="...">` paths in the `#work` section to point locally.

## 4. Personalize further
- **Hero** (`#hero`): name, tagline, stats, and the orbit icon set inside
  `#orbitStage` — each `.orbit-icon` has `data-ring="a"` or `"b"`.
- **About** (`#about`): paragraphs and spec cards.
- **Stack** (`#stack`): the two marquee rows — each icon is duplicated once
  in the markup for the seamless loop; edit both copies if you change one.
- **Work** (`#work`): the three `.sheet` cards (image + text).
- **Path** (`#path`): the three `.record` entries and expandable details.
- **Credentials** (`#credentials`): certification link, education, languages.
- **Contact** (`#contact`): your links.

## 5. Deploy to GitHub Pages
1. Create a repo (`yourname.github.io` for a root-domain site, or any name
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
3. **Settings → Pages → Source → Deploy from a branch → `main` / `/(root)`**.
4. Live at `https://<you>.github.io/` or `https://<you>.github.io/<repo>/`.

## Structure
```
index.html            all page content/sections
css/style.css          design system — tokens at the top of the file
js/globe-scene.js      the hero's Three.js globe
js/main.js             nav behavior, orbit alignment, glow, reveals, counters
assets/icons/          the 13 technology logos
assets/logos/          Kiya.ai, LTIMindtree, Jetto Technologies logos
assets/resume.pdf      linked from "Résumé ↓" in the nav
```

## Project Logo Setup

The project experience section references these logo filenames under `assets/logos/`:

- `Absa_logo.png` — ABSA Verse
- `akashadarshan.png` — Akashdarshan
- `qib.png` — Qatar Islamic Bank UK (included in this package)

Add the first two image files to `portfolio/assets/logos/` using the exact filenames above. The HTML already points to those paths.
