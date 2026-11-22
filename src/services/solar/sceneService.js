import * as THREE from 'three';
import { createTextureService } from './textureService.js';

function createGradMap(steps = 4) {
  const d = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) d[i] = Math.round((i / (steps - 1)) * 255);
  const t = new THREE.DataTexture(d, steps, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}

// The renderer is owned by the stage controller and shared with the room scene.
const START_PHASES = [0.3, 2.2, 4.0, 1.2, 2.9, 0.9, 1.9, 2.5];

// Fresnel rim on the toon planets so their night side still reads against space.
function addRimLight(material, hex) {
  const rimColor = new THREE.Color(hex).lerp(new THREE.Color(0xffffff), 0.55);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRim = { value: rimColor };
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uRim;')
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
        float rimTerm = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);
        gl_FragColor.rgb += uRim * rimTerm * 0.55 * opacity;`);
  };
}

export function createSolarScene({ renderer, projects }) {
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const textureService = createTextureService(renderer);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1d);

  const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 1000);
  camera.position.set(-4, 24, 82);

  const sph = {
    theta: Math.atan2(camera.position.x, camera.position.z),
    phi: Math.acos(camera.position.y / camera.position.length()),
    r: camera.position.length(),
  };

  const gradMap = createGradMap(4);

  scene.add(new THREE.AmbientLight(0x7799dd, 12.0));

  const sunLight = new THREE.PointLight(0xffffff, 15.0, 600);
  scene.add(sunLight);

  const fillA = new THREE.DirectionalLight(0x8899dd, 3.5);
  fillA.position.set(20, 40, 20);
  scene.add(fillA);

  const fillB = new THREE.DirectionalLight(0x6d5d7c, 2.2);
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
    opacity: 1.0,
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
      emissiveIntensity: 1.2,
    })
  );
  sunCore.userData = { idx: -1, name: 'Soleil' };
  sunGroup.add(sunCore);

  // Corona: additive camera-facing glow, so the sun reads as light, not a disc with rings.
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 256;
  const g = glowCanvas.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,240,190,1)');
  grad.addColorStop(0.18, 'rgba(255,205,110,0.75)');
  grad.addColorStop(0.42, 'rgba(255,150,50,0.22)');
  grad.addColorStop(1, 'rgba(255,120,30,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  const corona = [];
  [[19, 0.9], [34, 0.35]].forEach(([size, opacity]) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    sprite.scale.setScalar(size);
    sprite.userData.baseOpacity = opacity;
    corona.push(sprite);
    sunGroup.add(sprite);
  });

  const pivots = [];
  const meshes = [];
  const interactives = [sunCore];

  projects.forEach((p, idx) => {
    if (p.available === false) {
      return;
    }

    const pivot = new THREE.Object3D();
    // Starting phases keep every body on the far side or flanks of the opening
    // view, so none sits half-clipped at the bottom edge.
    pivot.rotation.y = START_PHASES[idx % START_PHASES.length];
    scene.add(pivot);
    pivots[idx] = pivot;

    const maps = textureService.createPlanetMaps(p.planet, p.hex);
    const mat = new THREE.MeshToonMaterial({
      color: p.hex,
      emissive: p.emissive || 0x000000,
      emissiveIntensity: 0.7,
      gradientMap: gradMap,
      map: maps.map,
      bumpMap: maps.bumpMap,
      bumpScale: maps.bumpScale,
    });
    addRimLight(mat, p.hex);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 48, 48), mat);
    mesh.rotation.order = 'YXZ';
    mesh.position.x = p.dist;
    mesh.castShadow = true;
    mesh.userData = { idx, name: p.planet, baseQuaternion: mesh.quaternion.clone(), available: true };
    pivot.add(mesh);
    meshes[idx] = mesh;
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
          opacity: 0.75,
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
      const ring = new THREE.Mesh(rGeo, new THREE.MeshStandardMaterial({
        color: 0xe2cfa4,
        map: ringMaps.map,
        alphaMap: ringMaps.alphaMap,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        roughness: 1,
        metalness: 0,
        opacity: 1.0,
      }));
      ring.rotation.x = Math.PI / 2.8;
      mesh.add(ring);
    }
  });

  projects.forEach((p) => {
    if (p.available === false) {
      return;
    }

    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist));
    }
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.65, linewidth: 1.5 })
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
    corona,
    pivots,
    meshes,
    interactives,
    textureService,
    W,
    H,
  };
}
