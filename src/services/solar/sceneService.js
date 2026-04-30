import * as THREE from 'three';
import { createTextureService } from './textureService.js';

function createGradMap(steps = 4) {
  const d = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) d[i] = Math.round((i / (steps - 1)) * 255);
  const t = new THREE.DataTexture(d, steps, 1, THREE.LuminanceFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}

export function createSolarScene({ canvas, projects }) {
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.outputEncoding = THREE.sRGBEncoding;

  const textureService = createTextureService(renderer);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02050f);

  const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 1000);
  camera.position.set(-4, 24, 82);

  const sph = {
    theta: Math.atan2(camera.position.x, camera.position.z),
    phi: Math.acos(camera.position.y / camera.position.length()),
    r: camera.position.length(),
  };

  const gradMap = createGradMap(4);

  scene.add(new THREE.AmbientLight(0x11224a, 2.2));

  const sunLight = new THREE.PointLight(0xfff8e0, 3.8, 360);
  scene.add(sunLight);

  const fillA = new THREE.DirectionalLight(0x4466aa, 0.4);
  fillA.position.set(20, 40, 20);
  scene.add(fillA);

  const fillB = new THREE.DirectionalLight(0x221133, 0.3);
  fillB.position.set(-20, -10, -20);
  scene.add(fillB);

  const starGeo = new THREE.BufferGeometry();
  const starCount = 2800;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 200 + Math.random() * 280;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(p) * Math.cos(t);
    starPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    starPos[i * 3 + 2] = r * Math.cos(p);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.38,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
  })));

  const sunGroup = new THREE.Group();
  scene.add(sunGroup);

  const sunMaps = textureService.createSunMaps();
  const sunCore = new THREE.Mesh(
    new THREE.SphereGeometry(3.8, 32, 32),
    new THREE.MeshToonMaterial({
      color: 0xffd768,
      gradientMap: gradMap,
      map: sunMaps.map,
      bumpMap: sunMaps.bumpMap,
      bumpScale: sunMaps.bumpScale,
      emissive: 0xff8a18,
      emissiveIntensity: 0.28,
    })
  );
  sunCore.userData = { idx: -1, name: 'Soleil' };
  sunGroup.add(sunCore);

  [[4.4, 0xff9900, 0.13], [5.2, 0xffcc00, 0.06], [6.5, 0xffaa00, 0.03]].forEach(([r, c, o]) => {
    sunGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(r, 32, 32),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.BackSide })
    ));
  });

  const pivots = [];
  const meshes = [];
  const interactives = [sunCore];

  projects.forEach((p, idx) => {
    const pivot = new THREE.Object3D();
    pivot.rotation.y = (idx / projects.length) * Math.PI * 2;
    scene.add(pivot);
    pivots.push(pivot);

    const maps = textureService.createPlanetMaps(p.planet, p.hex);
    const mat = new THREE.MeshToonMaterial({
      color: p.hex,
      emissive: p.emissive || 0x000000,
      emissiveIntensity: 0.12,
      gradientMap: gradMap,
      map: maps.map,
      bumpMap: maps.bumpMap,
      bumpScale: maps.bumpScale,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 32, 32), mat);
    mesh.rotation.order = 'YXZ';
    mesh.position.x = p.dist;
    mesh.castShadow = true;
    mesh.userData = { idx, name: p.planet, baseQuaternion: mesh.quaternion.clone() };
    pivot.add(mesh);
    meshes.push(mesh);
    interactives.push(mesh);

    if (p.bands) {
      const bandColors = [0xb87030, 0xe8a860, 0xa06020];
      for (let b = 0; b < 6; b++) {
        const phiStart = (b / 6) * Math.PI + 0.3;
        const phiLen = Math.PI * 0.13;
        const bGeo = new THREE.SphereGeometry(p.r + 0.02, 28, 6, 0, Math.PI * 2, phiStart, phiLen);
        mesh.add(new THREE.Mesh(bGeo, new THREE.MeshToonMaterial({
          color: bandColors[b % 3],
          gradientMap: gradMap,
          transparent: true,
          opacity: 0.55,
        })));
      }
    }

    if (p.ring) {
      const ringMaps = textureService.createSaturnRingMaps(`ring-${p.planet}`);
      const rGeo = new THREE.RingGeometry(p.r * 1.55, p.r * 2.7, 64);
      const pos = rGeo.attributes.position;
      const uvs = new Float32Array(pos.count * 2);
      const v = new THREE.Vector3();
      const outer = p.r * 2.7;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        uvs[i * 2] = (v.x / outer + 1) / 2;
        uvs[i * 2 + 1] = (v.y / outer + 1) / 2;
      }
      rGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      const ring = new THREE.Mesh(rGeo, new THREE.MeshToonMaterial({
        color: 0xc8a86b,
        gradientMap: gradMap,
        map: ringMaps.map,
        alphaMap: ringMaps.alphaMap,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82,
      }));
      ring.rotation.x = Math.PI / 2.8;
      mesh.add(ring);
    }
  });

  projects.forEach((p) => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist));
    }
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.35 })
    ));
  });

  return {
    THREE,
    renderer,
    scene,
    camera,
    gradMap,
    sph,
    sunGroup,
    sunCore,
    pivots,
    meshes,
    interactives,
    textureService,
    W,
    H,
  };
}
