import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/**
 * Builds the "Signal Core" — a wireframe icosphere with elliptical rings
 * and glowing nodes, in electric blue. Exposes a setScrollProgress() hook
 * so the caller can drive extra rotation/zoom from page scroll position,
 * similar to a scroll-linked product reveal.
 */
export function initOrbitScene(canvas) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.4, 9);

  const group = new THREE.Group();
  scene.add(group);

  const blue = 0x2E8FFF;
  const blueDeep = 0x1450C4;
  const ice = 0xB9E9FF;

  // Core icosphere (wireframe)
  const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
  const coreMat = new THREE.MeshBasicMaterial({ color: blue, wireframe: true, transparent: true, opacity: 0.4 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Inner solid glow sphere
  const glowGeo = new THREE.IcosahedronGeometry(1.05, 2);
  const glowMat = new THREE.MeshBasicMaterial({ color: ice, transparent: true, opacity: 0.06 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  // Elliptical orbit rings
  const rings = [];
  const ringConfigs = [
    { rx: 3.1, ry: 3.1, rz: 0.4, tilt: [0.5, 0.2, 0], color: blue, speed: 0.06 },
    { rx: 4.0, ry: 4.0, rz: 0.9, tilt: [1.2, 0.6, 0.3], color: ice, speed: -0.045 },
    { rx: 5.0, ry: 5.0, rz: 1.4, tilt: [-0.6, 1.0, 0.4], color: blueDeep, speed: 0.03 },
  ];

  ringConfigs.forEach((cfg) => {
    const curve = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(128).map(p => new THREE.Vector3(p.x, p.y * (cfg.rz / cfg.rx), 0));
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.32 });
    const ring = new THREE.LineLoop(geo, mat);
    ring.rotation.set(cfg.tilt[0], cfg.tilt[1], cfg.tilt[2]);
    ring.userData.speed = cfg.speed;
    group.add(ring);
    rings.push(ring);
  });

  // Orbiting nodes (small glowing points riding the rings)
  const nodes = [];
  const nodeColors = [blue, ice, blueDeep, blue, ice];
  for (let i = 0; i < 5; i++) {
    const cfg = ringConfigs[i % ringConfigs.length];
    const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: nodeColors[i] });
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.userData = {
      rx: cfg.rx, ry: cfg.ry, rz: cfg.rz,
      tilt: cfg.tilt,
      angle: (i / 5) * Math.PI * 2,
      speed: 0.25 + i * 0.05,
    };
    group.add(node);
    nodes.push(node);
  }

  // Faint starfield
  const starCount = 420;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 30;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xB9E9FF, size: 0.02, transparent: true, opacity: 0.55 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  function applyPointOnEllipse(node) {
    const { rx, ry, rz, tilt, angle } = node.userData;
    const x = Math.cos(angle) * rx;
    const y = Math.sin(angle) * ry * (rz / rx);
    const v = new THREE.Vector3(x, y, 0);
    const euler = new THREE.Euler(tilt[0], tilt[1], tilt[2]);
    v.applyEuler(euler);
    node.position.copy(v);
  }

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Scroll-driven state, updated externally via setScrollProgress()
  let scrollProgress = 0;      // 0 → 1 while hero is in view
  let targetScrollProgress = 0;

  function setScrollProgress(p) {
    targetScrollProgress = Math.max(0, Math.min(1, p));
  }

  function resize() {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();

  function tick() {
    const dt = prefersReducedMotion ? 0 : clock.getDelta();

    // Smoothly ease toward the latest scroll progress (Apple-style lerp)
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;

    core.rotation.y += dt * 0.08;
    core.rotation.x += dt * 0.03;
    glow.rotation.y -= dt * 0.05;

    rings.forEach(r => { r.rotation.z += dt * r.userData.speed; });
    nodes.forEach(n => { n.userData.angle += dt * n.userData.speed * 0.3; applyPointOnEllipse(n); });

    // Mouse parallax
    const targetRotY = mouseX * 0.25 + scrollProgress * Math.PI * 0.9;
    const targetRotX = -mouseY * 0.12 + scrollProgress * 0.5;
    group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.04;

    // Dolly the camera back and tilt down slightly as the user scrolls the hero away
    camera.position.z = 9 + scrollProgress * 3.5;
    camera.position.y = 0.4 + scrollProgress * 1.4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();

  return { renderer, scene, camera, setScrollProgress };
}
