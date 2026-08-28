import { initOrbitScene } from './three-scene.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* ---------- Orbit scene (hero 3D background) ---------- */
const canvas = document.getElementById('orbitCanvas');
const heroEl = document.getElementById('hero');
let orbitScene = null;
if (canvas) orbitScene = initOrbitScene(canvas);

/* ---------- Nav scroll state ---------- */
const nav = document.getElementById('nav');
function updateNavState() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}

/* ---------- Scroll-driven hero: parallax + 3D rotation (Apple-style) ---------- */
const heroContent = document.querySelector('.hero-content');
const heroPortrait = document.querySelector('.hero-portrait');

function updateHeroScroll() {
  if (!heroEl) return;
  const heroHeight = heroEl.offsetHeight || window.innerHeight;
  const raw = window.scrollY / heroHeight;
  const progress = Math.max(0, Math.min(1, raw));

  if (orbitScene) orbitScene.setScrollProgress(progress);

  if (!prefersReducedMotion) {
    const fade = Math.max(0, 1 - progress * 1.6);
    const lift = progress * 90;
    if (heroContent) {
      heroContent.style.transform = `translateY(${-lift * 0.4}px)`;
      heroContent.style.opacity = fade;
    }
    if (heroPortrait) {
      heroPortrait.style.transform = `translateY(calc(-50% + ${lift * 0.6}px))`;
      heroPortrait.style.opacity = fade;
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

/* ---------- Custom cursor ---------- */
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
if (cursorDot && cursorRing && window.matchMedia('(min-width: 861px)').matches) {
  let cx = 0, cy = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    cx = e.clientX; cy = e.clientY;
    cursorDot.style.left = cx + 'px';
    cursorDot.style.top = cy + 'px';
  });
  function animRing() {
    rx += (cx - rx) * 0.18;
    ry += (cy - ry) * 0.18;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.querySelectorAll('a, button, .tilt-card, .orbit-node').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });
}

/* ---------- Portrait image load / fallback ---------- */
const portraitImg = document.getElementById('portraitImg');
if (portraitImg) {
  const showIfLoaded = () => {
    if (portraitImg.naturalWidth > 1) portraitImg.classList.add('loaded');
  };
  portraitImg.addEventListener('load', showIfLoaded);
  portraitImg.addEventListener('error', () => { portraitImg.style.display = 'none'; });
  if (portraitImg.complete) showIfLoaded();
}

/* ---------- Orbit map node positioning (Skills section) ---------- */
function layoutOrbitNodes() {
  const map = document.getElementById('orbitMap');
  if (!map) return;
  const size = map.clientWidth;
  const ringRadii = { 1: size * 0.20, 2: size * 0.34, 3: size * 0.5 };

  document.querySelectorAll('.orbit-node').forEach(node => {
    const ring = node.dataset.ring;
    const angle = (parseFloat(node.dataset.angle) * Math.PI) / 180;
    const radius = ringRadii[ring] || size * 0.4;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    node.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  });
}
layoutOrbitNodes();
window.addEventListener('resize', layoutOrbitNodes);

/* ---------- Scroll reveal ---------- */
const revealTargets = document.querySelectorAll(
  '.section-head, .about-copy, .glass-card, .project-card, .timeline-item, .contact-panel'
);
revealTargets.forEach(el => el.setAttribute('data-reveal', ''));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => io.observe(el));

/* ---------- Tilt effect on glass cards (pointer devices only) ---------- */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${py * -6}deg) rotateY(${px * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

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
