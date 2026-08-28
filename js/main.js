import { initOrbitScene } from './three-scene.js';
import { initGlobeScene } from './globe-scene.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isDesktopWidth = window.matchMedia('(min-width: 861px)').matches;

/* ---------- Loader ---------- */
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
let progress = 0;
const loaderInterval = setInterval(() => {
  progress += Math.random() * 18;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loaderInterval);
    setTimeout(() => loader.classList.add('hidden'), 350);
  }
  loaderFill.style.width = progress + '%';
}, 160);

/* ---------- Hero orbit scene (3D background) ---------- */
const canvas = document.getElementById('orbitCanvas');
const heroEl = document.getElementById('hero');
let orbitScene = null;
if (canvas) orbitScene = initOrbitScene(canvas);

/* ---------- Skills globe scene ---------- */
const globeCanvas = document.getElementById('globeCanvas');
if (globeCanvas) initGlobeScene(globeCanvas);

/* ---------- Nav scroll state ---------- */
const nav = document.getElementById('nav');
function updateNavState() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}

/* ---------- Scroll-driven hero: parallax + 3D rotation (Apple-style) ---------- */
const heroContent = document.querySelector('.hero-content');
const heroPhoto = document.querySelector('.hero-photo-float');

function updateHeroScroll() {
  if (!heroEl) return;
  const heroHeight = heroEl.offsetHeight || window.innerHeight;
  const raw = window.scrollY / heroHeight;
  const scrollProgress = Math.max(0, Math.min(1, raw));

  if (orbitScene) orbitScene.setScrollProgress(scrollProgress);

  if (!prefersReducedMotion) {
    const fade = Math.max(0, 1 - scrollProgress * 1.6);
    const lift = scrollProgress * 90;
    if (heroContent) {
      heroContent.style.transform = `translateY(${-lift * 0.4}px)`;
      heroContent.style.opacity = fade;
    }
    if (heroPhoto) {
      heroPhoto.style.opacity = fade;
    }
  }
}

let ticking = false;
function onScroll() {
  updateNavState();
  if (!ticking) {
    requestAnimationFrame(() => {
      updateHeroScroll();
      updateProjectTilts();
      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
updateNavState();
updateHeroScroll();

/* ---------- Scroll-driven rotation on project visuals ---------- */
const projectVisuals = Array.from(document.querySelectorAll('.project-visual'));

function updateProjectTilts() {
  if (prefersReducedMotion || projectVisuals.length === 0) return;
  const viewportH = window.innerHeight;
  projectVisuals.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const centerOffset = (rect.top + rect.height / 2 - viewportH / 2) / viewportH; // -0.5..0.5
    const rotation = centerOffset * 40; // degrees
    el.style.transform = `rotate(${rotation}deg) scale(${1 - Math.abs(centerOffset) * 0.08})`;
  });
}

/* ---------- Custom cursor + golden spotlight ---------- */
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const spotlight = document.getElementById('cursorSpotlight');

if (cursorDot && cursorRing && isDesktopWidth && isFinePointer) {
  let cx = 0, cy = 0, rx = 0, ry = 0;
  let spotlightShown = false;

  window.addEventListener('mousemove', (e) => {
    cx = e.clientX; cy = e.clientY;
    cursorDot.style.left = cx + 'px';
    cursorDot.style.top = cy + 'px';

    if (spotlight) {
      spotlight.style.transform = `translate(${cx - 260}px, ${cy - 260}px)`;
      if (!spotlightShown) {
        spotlight.classList.add('active');
        spotlightShown = true;
      }
    }
  });

  function animRing() {
    rx += (cx - rx) * 0.18;
    ry += (cy - ry) * 0.18;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.querySelectorAll('a, button, .tilt-card, .orbit3d-icon').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });
} else if (spotlight) {
  spotlight.remove();
}

/* ---------- Hero photo load / fallback ---------- */
const portraitImg = document.getElementById('portraitImg');
if (portraitImg) {
  const showIfLoaded = () => {
    if (portraitImg.naturalWidth > 1) portraitImg.classList.add('loaded');
  };
  portraitImg.addEventListener('load', showIfLoaded);
  portraitImg.addEventListener('error', () => { portraitImg.style.display = 'none'; });
  if (portraitImg.complete) showIfLoaded();
}

/* ---------- Tech orbit: 3D-style icon motion around the globe ---------- */
/* Positions are computed each frame as plain 2D transforms (translate + scale),
   never CSS 3D transforms — this is what keeps icons upright and correctly
   ordered on iOS Safari, which has known issues with nested preserve-3d. */
(function initTechOrbit() {
  const stage = document.getElementById('orbit3d');
  if (!stage) return;

  const ringConfig = {
    a: { speed: 0.16, tilt: 0.34, radiusFactor: 0.30 },
    b: { speed: -0.11, tilt: 0.30, radiusFactor: 0.46 },
    c: { speed: 0.08,  tilt: 0.26, radiusFactor: 0.66 },
  };

  const groups = { a: [], b: [], c: [] };
  stage.querySelectorAll('.orbit3d-icon').forEach((el) => {
    const ring = el.dataset.ring;
    if (groups[ring]) groups[ring].push(el);
  });

  Object.keys(groups).forEach((ring) => {
    const total = groups[ring].length;
    groups[ring].forEach((el, i) => {
      el.dataset.baseAngle = String((i / total) * Math.PI * 2);
    });
  });

  let angleT = 0;
  let running = true;
  let lastTime = performance.now();

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (!prefersReducedMotion) angleT += dt;

    const stageSize = Math.min(stage.clientWidth, stage.clientHeight);

    Object.entries(groups).forEach(([ring, els]) => {
      const cfg = ringConfig[ring];
      const radius = stageSize * cfg.radiusFactor;
      els.forEach((el) => {
        const base = parseFloat(el.dataset.baseAngle);
        const angle = base + angleT * cfg.speed;

        const x = Math.sin(angle) * radius;
        const zRaw = Math.cos(angle); // -1 (back) .. 1 (front)
        const y = zRaw * radius * cfg.tilt; // tilt the ring into an ellipse

        const depth = (zRaw + 1) / 2; // 0 back .. 1 front
        const scale = 0.62 + depth * 0.55;
        const opacity = 0.35 + depth * 0.65;
        const z = Math.round(depth * 100);

        el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        el.style.opacity = opacity;
        el.style.zIndex = z;
      });
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Pause the loop when the section is off-screen to save CPU/GPU.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const wasRunning = running;
      running = entry.isIntersecting;
      if (running && !wasRunning) {
        lastTime = performance.now();
        requestAnimationFrame(frame);
      }
    });
  }, { threshold: 0.05 });
  io.observe(stage);
})();

/* ---------- Scroll reveal ---------- */
const revealTargets = document.querySelectorAll(
  '.section-head, .about-copy, .glass-card, .project-card, .timeline-item, .contact-panel'
);
revealTargets.forEach(el => el.setAttribute('data-reveal', ''));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => revealObserver.observe(el));

/* ---------- Tilt + cursor-tracked glow on cards (pointer devices only) ---------- */
if (isFinePointer) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${py * -6}deg) rotateY(${px * 6}deg) translateY(-4px)`;
      card.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(py + 0.5) * 100}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ---------- Rare, tiny rocket accent ---------- */
(function scheduleRocket() {
  if (prefersReducedMotion || !isDesktopWidth) return;
  const rocket = document.getElementById('rocket');
  if (!rocket) return;

  function launch() {
    rocket.style.top = `${10 + Math.random() * 45}%`;
    rocket.classList.remove('fly');
    // force reflow so the animation can restart
    void rocket.offsetWidth;
    rocket.classList.add('fly');
  }

  function scheduleNext() {
    const delay = 25000 + Math.random() * 35000; // rare: every ~25-60s
    setTimeout(() => {
      launch();
      scheduleNext();
    }, delay);
  }
  scheduleNext();
})();

/* ---------- Mobile nav toggle ---------- */
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  function closeMenu() {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  burger.addEventListener('click', toggleMenu);
  navLinks.querySelectorAll('[data-close]').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}
