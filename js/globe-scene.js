import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/**
 * A small rotating wireframe globe with a handful of glowing arc
 * connections between points on its surface — a compact "global network"
 * centerpiece for the tech-stack orbit. Kept deliberately simple/cheap:
 * one low-poly sphere, ~7 arcs, no postprocessing.
 */
export function initGlobeScene(canvas) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 5.4);

  const group = new THREE.Group();
  scene.add(group);

  const blue = 0x2E8FFF;
  const gold = 0xE8B84B;
  const warm = 0xFFF3DD;

  const RADIUS = 1.45;

  // Wireframe sphere (the globe itself)
  const globeGeo = new THREE.IcosahedronGeometry(RADIUS, 3);
  const globeMat = new THREE.MeshBasicMaterial({ color: blue, wireframe: true, transparent: true, opacity: 0.32 });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  group.add(globe);

  // Faint solid core for depth/glow
  const coreGeo = new THREE.SphereGeometry(RADIUS * 0.97, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({ color: warm, transparent: true, opacity: 0.035 });
  group.add(new THREE.Mesh(coreGeo, coreMat));

  // A thin latitude/longitude ring set for a "networking" feel
  [0, Math.PI / 3, (2 * Math.PI) / 3].forEach((tilt, i) => {
    const curve = new THREE.EllipseCurve(0, 0, RADIUS * 1.001, RADIUS * 1.001, 0, 2 * Math.PI, false, 0);
    const pts = curve.getPoints(96).map(p => new THREE.Vector3(p.x, p.y, 0));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: i === 1 ? gold : blue, transparent: true, opacity: 0.22 });
    const ring = new THREE.LineLoop(geo, mat);
    ring.rotation.set(tilt, tilt * 0.6, 0);
    group.add(ring);
  });

  // Random points on the sphere surface, connected by lifted arcs
  function randomSpherePoint() {
    const u = Math.random(), v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    return new THREE.Vector3(
      RADIUS * Math.sin(phi) * Math.cos(theta),
      RADIUS * Math.cos(phi),
      RADIUS * Math.sin(phi) * Math.sin(theta)
    );
  }

  const nodePoints = Array.from({ length: 7 }, randomSpherePoint);
  const nodeDots = [];
  const dotGeo = new THREE.SphereGeometry(0.028, 8, 8);
  nodePoints.forEach((p) => {
    const dotMat = new THREE.MeshBasicMaterial({ color: gold });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(p);
    group.add(dot);
    nodeDots.push(dot);
  });

  const arcs = [];
  for (let i = 0; i < 6; i++) {
    const a = nodePoints[i % nodePoints.length];
    const b = nodePoints[(i + 3) % nodePoints.length];
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS * 1.55);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const pts = curve.getPoints(40);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: 0.45 });
    const arc = new THREE.Line(geo, mat);
    group.add(arc);
    arcs.push(arc);
  }

  // Sparse, minimal starfield
  const starCount = 90;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 14;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: warm, size: 0.018, transparent: true, opacity: 0.4 });
  scene.add(new THREE.Points(starGeo, starMat));

  function resize() {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  let running = true;

  function tick() {
    if (!running) return;
    const dt = prefersReducedMotion ? 0 : clock.getDelta();
    group.rotation.y += dt * 0.12;
    group.rotation.x = Math.sin(clock.elapsedTime * 0.08) * 0.08;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  return {
    setVisible(v) { running = v; if (v) tick(); },
  };
}
