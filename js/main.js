import { initGlobeScene } from './globe-scene.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isDesktopWidth = window.matchMedia('(min-width: 861px)').matches;

/* ---------- Always open at the top ---------- */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));

/* ---------- Intro curtain ---------- */
const curtain = document.getElementById('curtain');
window.addEventListener('load', () => {
  setTimeout(() => curtain && curtain.classList.add('hidden'), 500);
});
setTimeout(() => curtain && curtain.classList.add('hidden'), 2200);

/* ---------- Hero globe scene ---------- */
const globeCanvas = document.getElementById('globeCanvas');
let globeScene = null;
if (globeCanvas) globeScene = initGlobeScene(globeCanvas);

/* ---------- Individual hero letter hover ---------- */
document.querySelectorAll('.hero-line[data-word]').forEach((line) => {
  const word = line.dataset.word || line.textContent.trim();
  line.setAttribute('aria-label', word);
  line.innerHTML = [...word].map((letter, index) => {
    const safe = letter === ' ' ? '&nbsp;' : letter;
    return `<span class="hero-letter" style="--letter-index:${index}">${safe}</span>`;
  }).join('');
});

/* ---------- Hero photo fade-in once loaded ---------- */
const portraitImg = document.getElementById('portraitImg');
if (portraitImg) {
  const showIfLoaded = () => { if (portraitImg.naturalWidth > 1) portraitImg.classList.add('loaded'); };
  portraitImg.addEventListener('load', showIfLoaded);
  if (portraitImg.complete) showIfLoaded();
}

/* ---------- Nav: hide on scroll down, reveal on scroll up (slow, cinematic) ---------- */
const nav = document.getElementById('nav');
let lastScrollY = window.scrollY;
let navDirTicking = false;

function updateNavVisibility() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  const menuOpen = document.getElementById('navLinks')?.classList.contains('open');
  if (menuOpen) { lastScrollY = y; return; }
  if (y > lastScrollY + 4 && y > 120) {
    nav.classList.add('nav-hidden');
  } else if (y < lastScrollY - 4 || y < 120) {
    nav.classList.remove('nav-hidden');
  }
  lastScrollY = y;
}

/* ---------- Lightweight hero motion ---------- */
if (globeScene) {
  window.addEventListener('scroll', () => {
    // Keep the background scene subtle while scrolling; never fade portfolio content.
    const heroHeight = document.getElementById('hero')?.offsetHeight || window.innerHeight;
    globeScene.setScrollProgress(Math.max(0, Math.min(1, window.scrollY / heroHeight)));
  }, { passive: true });
}

/* ---------- Cursor torch glow (desktop, fine pointer only) ---------- */
if (isDesktopWidth && isFinePointer) {
  const glow = document.getElementById('cursorGlow');
  if (glow) {
    let shown = false;
    window.addEventListener('mousemove', (e) => {
      glow.style.transform = `translate(${e.clientX - 390}px, ${e.clientY - 390}px)`;
      if (!shown) { glow.classList.add('active'); shown = true; }
    });
  }
}

/* ---------- Magnetic buttons ---------- */
if (isFinePointer) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ---------- Glow-from-background hover, tracked to cursor position ---------- */
if (isFinePointer) {
  document.querySelectorAll('.spec-card, .sheet, .record, .tech-pill, .contact-link').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${mx}%`);
      card.style.setProperty('--my', `${my}%`);
    });
  });
}

/* ---------- Section title reveal-mask wrapping ---------- */
document.querySelectorAll('.section-title').forEach((title) => {
  const text = title.textContent;
  title.innerHTML = `<span class="reveal-mask"><span class="reveal-inner">${text}</span></span>`;
});

/* ---------- Scroll reveal (entrance) ---------- */
const revealTargets = document.querySelectorAll(
  '.section-head, .about-copy, .spec-card, .sheet, .record, .contact-panel'
);
revealTargets.forEach(el => el.setAttribute('data-reveal', ''));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealTargets.forEach(el => revealObserver.observe(el));

/* ---------- Animated stat counters ---------- */
document.querySelectorAll('.counter').forEach((el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  let done = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !done) {
        done = true;
        io.unobserve(el);
        if (prefersReducedMotion) { el.textContent = target + suffix; return; }
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    });
  }, { threshold: 0.5 });
  io.observe(el);
});

/* ---------- Project detail toggles ---------- */
document.querySelectorAll('.project-toggle').forEach((btn) => {
  const panel = btn.nextElementSibling;
  if (!panel || !panel.classList.contains('project-details')) return;
  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    const label = btn.querySelector('.project-toggle-label');
    if (label) label.textContent = isOpen ? 'Hide project details' : 'View project details';
  });
});

/* ---------- Record "Read more" toggles ---------- */
document.querySelectorAll('.record-toggle').forEach((btn) => {
  const panel = btn.nextElementSibling;
  if (!panel || !panel.classList.contains('record-details')) return;
  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.querySelector('.record-toggle-label').textContent = isOpen ? 'Show less' : 'Read more';
  });
});

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
  navLinks.querySelectorAll('[data-close]').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
}
