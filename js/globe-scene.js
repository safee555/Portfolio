import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/**
 * Subtle cinematic hero background.
 * The globe is deliberately pushed below the title and kept low-contrast so
 * it supports the typography instead of competing with it.
 */
export function initGlobeScene(canvas) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 80);
  camera.position.set(0, 0, 8);

  const globe = new THREE.Group();
  // Lower than the hero copy by design.
  globe.position.set(0, -2.65, -0.25);
  globe.scale.setScalar(.88);
  scene.add(globe);

  const blue = 0x6c7bff;
  const cyan = 0x4fe0d0;
  const gold = 0xffc47a;
  const white = 0xeaf0ff;

  // Minimal wire globe — no labels, no icons, no busy latitude network.
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.15, 2),
    new THREE.MeshBasicMaterial({ color:blue, wireframe:true, transparent:true, opacity:.13 })
  );
  globe.add(shell);

  const innerShell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.02, 1),
    new THREE.MeshBasicMaterial({ color:cyan, wireframe:true, transparent:true, opacity:.055 })
  );
  globe.add(innerShell);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 32, 32),
    new THREE.MeshBasicMaterial({ color:blue, transparent:true, opacity:.025 })
  );
  globe.add(glow);

  // A few elegant network traces, intentionally sparse.
  const tracePoints = [
    [0.7,1.75,0.9],[-1.3,.65,.95],[-1.65,-.75,.35],
    [.2,-1.8,.65],[1.55,-.45,.8],[1.25,.9,.55]
  ].map(([x,y,z]) => new THREE.Vector3(x,y,z).normalize().multiplyScalar(2.12));

  for(let i=0;i<tracePoints.length;i+=2){
    const a=tracePoints[i], b=tracePoints[(i+2)%tracePoints.length];
    const mid=a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(2.55);
    const curve=new THREE.QuadraticBezierCurve3(a,mid,b);
    const geo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(28));
    globe.add(new THREE.Line(geo,new THREE.LineBasicMaterial({
      color:i===2?gold:cyan, transparent:true, opacity:.16
    })));
  }

  // Fine cosmic particle field. Small, sparse, slow.
  const count = 520;
  const positions = new Float32Array(count*3);
  const phases = new Float32Array(count);
  const drift = new Float32Array(count);
  const palette = [blue, cyan, gold, white];

  for(let i=0;i<count;i++){
    const radius=9 + Math.random()*14;
    const theta=Math.random()*Math.PI*2;
    const phi=Math.acos(2*Math.random()-1);
    positions[i*3]=Math.sin(phi)*Math.cos(theta)*radius;
    positions[i*3+1]=Math.cos(phi)*radius*.72;
    positions[i*3+2]=Math.sin(phi)*Math.sin(theta)*radius-4;
    phases[i]=Math.random()*Math.PI*2;
    drift[i]=.04+Math.random()*.08;
  }
  // Four restrained point clouds. Each particle gets one tone rather than
  // stacking four colors on the same point.
  const particleField = new THREE.Group();
  scene.add(particleField);

  const particleColors = [white, blue, cyan, gold];
  const particleOpacity = [.42, .30, .20, .20];
  const particleSize = [.018, .022, .019, .018];
  for(let bucket=0; bucket<4; bucket++){
    const bucketPositions = [];
    for(let i=bucket; i<count; i+=4){
      bucketPositions.push(positions[i*3],positions[i*3+1],positions[i*3+2]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(bucketPositions,3));
    const mat = new THREE.PointsMaterial({
      color:particleColors[bucket],
      size:particleSize[bucket],
      transparent:true,
      opacity:particleOpacity[bucket],
      sizeAttenuation:true,
      depthWrite:false
    });
    particleField.add(new THREE.Points(geo,mat));
  }

  let mouseX=0, mouseY=0;
  window.addEventListener('mousemove',e=>{
    mouseX=(e.clientX/window.innerWidth-.5)*2;
    mouseY=(e.clientY/window.innerHeight-.5)*2;
  },{passive:true});

  let targetScroll=0;
  function setScrollProgress(p){ targetScroll=Math.max(0,Math.min(1,p)); }

  function resize(){
    const parent=canvas.parentElement;
    const w=parent?.clientWidth || window.innerWidth;
    const h=parent?.clientHeight || window.innerHeight;
    if(!w||!h)return;
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize',resize,{passive:true});
  resize();

  const clock=new THREE.Clock();
  let scrollP=0;

  function tick(){
    const dt=reduced?0:Math.min(clock.getDelta(),.05);
    scrollP+=(targetScroll-scrollP)*.045;

    particleField.rotation.y+=dt*.0025;
    particleField.rotation.x+=dt*.0007;

    shell.rotation.y+=dt*.045;
    innerShell.rotation.y-=dt*.018;
    globe.rotation.x+=( -mouseY*.055 + scrollP*.08 - globe.rotation.x)*.025;
    globe.rotation.y+=( mouseX*.08 + scrollP*.12 - globe.rotation.y)*.025;

    // As the user scrolls away, the globe gently settles lower rather than
    // fading the page content.
    globe.position.y += ((-2.65 - scrollP*.75)-globe.position.y)*.025;

    renderer.render(scene,camera);
    requestAnimationFrame(tick);
  }
  tick();

  return { setScrollProgress };
}
