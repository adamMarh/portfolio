import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { createCrtScreenMaterial } from './crtShader.js';

// The dark 90s room, built entirely in code: no downloaded models or images.
// Units are metres. x right, y up, z toward the visitor. The desk top is y = 0.75.

const WALL_Z = -0.66;
const ROOM_X = 1.4;
const NEON_PINK = new THREE.Color(0xff3d9a);
const NEON_CYAN = new THREE.Color(0x3ef0ff);
const PLASTIC = 0xd8cba6;
const MONITOR_SCALE = 1.15; // a 17-inch tube: the focal object of the room

function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStep(t, rate, salt) {
  const n = Math.sin(Math.floor(t * rate) * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function canvasTexture(w, h, draw, { srgb = true, repeat } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  return tex;
}

function speckle(ctx, w, h, count, rng, colors, size = 2) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
    ctx.fillRect(rng() * w, rng() * h, size * (0.5 + rng()), size * (0.5 + rng()));
  }
}

// ---------- materials ----------

function createMaterials() {
  const rng = seeded(11);

  const wall = canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#2a3533';
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) {
      g.fillStyle = x % 64 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.05)';
      g.fillRect(x, 0, 16, h);
    }
    speckle(g, w, h, 9000, rng, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.03)', 'rgba(20,30,28,0.12)'], 3);
  }, { repeat: [1, 1] });

  const wallRough = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#d8d8d8';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 4000, rng, ['#bdbdbd', '#f0f0f0'], 2);
  }, { srgb: false, repeat: [4, 4] });

  const wood = canvasTexture(1024, 512, (g, w, h) => {
    g.fillStyle = '#6a4329';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) {
      const y = rng() * h;
      const amp = 2 + rng() * 6;
      const freq = 0.004 + rng() * 0.01;
      g.strokeStyle = rng() > 0.5 ? 'rgba(28,14,6,0.42)' : 'rgba(170,110,62,0.3)';
      g.lineWidth = 0.6 + rng() * 2.2;
      g.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const yy = y + Math.sin(x * freq + i) * amp + Math.sin(x * 0.03 + i * 2) * 0.8;
        if (x === 0) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.stroke();
    }
    // Worn patch where hands rest.
    const wear = g.createRadialGradient(w * 0.55, h * 0.85, 10, w * 0.55, h * 0.85, w * 0.35);
    wear.addColorStop(0, 'rgba(150,100,60,0.18)');
    wear.addColorStop(1, 'rgba(150,100,60,0)');
    g.fillStyle = wear;
    g.fillRect(0, 0, w, h);
  });

  const carpet = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#14191c';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 6000, rng, ['#1d2428', '#0c1012', '#22292c'], 2);
  }, { repeat: [6, 6] });

  const plastic = new THREE.MeshStandardMaterial({ color: PLASTIC, roughness: 0.62, metalness: 0 });
  const plasticDark = new THREE.MeshStandardMaterial({ color: 0x8f866f, roughness: 0.7 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.85 });

  return {
    wall: new THREE.MeshStandardMaterial({ map: wall, roughnessMap: wallRough, roughness: 0.95 }),
    wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55, metalness: 0 }),
    carpet: new THREE.MeshStandardMaterial({ map: carpet, roughness: 1 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x0d1111, roughness: 1 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x231d1a, roughness: 0.6 }),
    plastic,
    plasticDark,
    rubber,
    cable: new THREE.MeshStandardMaterial({ color: 0x0b0c0d, roughness: 0.5 }),
  };
}

// ---------- contact shadows ----------

let shadowTexture;
function contactShadow(w, d, opacity = 0.65) {
  if (!shadowTexture) {
    shadowTexture = canvasTexture(128, 128, (g, cw, ch) => {
      const grad = g.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, cw / 2);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.55, 'rgba(0,0,0,0.55)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, cw, ch);
    }, { srgb: false });
  }
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity, depthWrite: false, color: 0x000000 })
  );
  mesh.material.alphaMap = shadowTexture;
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 1;
  return mesh;
}

// ---------- room shell ----------

function buildShell(m, window) {
  const group = new THREE.Group();

  const shape = new THREE.Shape();
  shape.moveTo(-ROOM_X, 0);
  shape.lineTo(ROOM_X, 0);
  shape.lineTo(ROOM_X, 2.5);
  shape.lineTo(-ROOM_X, 2.5);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(window.x0, window.y0);
  hole.lineTo(window.x0, window.y1);
  hole.lineTo(window.x1, window.y1);
  hole.lineTo(window.x1, window.y0);
  hole.closePath();
  shape.holes.push(hole);
  const back = new THREE.Mesh(new THREE.ShapeGeometry(shape), m.wall);
  back.position.z = WALL_Z;
  m.wall.map.repeat.set(0.75, 0.75);
  group.add(back);

  const sideGeo = new THREE.PlaneGeometry(2.8, 2.5);
  const left = new THREE.Mesh(sideGeo, m.wall);
  left.rotation.y = Math.PI / 2;
  left.position.set(-ROOM_X, 1.25, WALL_Z + 1.4);
  group.add(left);
  const right = left.clone();
  right.rotation.y = -Math.PI / 2;
  right.position.x = ROOM_X;
  group.add(right);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), m.carpet);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, WALL_Z + 1.4);
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), m.ceiling);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 2.5, WALL_Z + 1.4);
  group.add(ceiling);

  return group;
}

// ---------- desk ----------

function buildDesk(m) {
  const group = new THREE.Group();
  const top = new THREE.Mesh(new RoundedBoxGeometry(1.56, 0.035, 0.74, 2, 0.006), m.wood);
  top.position.set(0, 0.7325, -0.25);
  group.add(top);
  [-0.76, 0.76].forEach((x) => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.715, 0.7), m.wood);
    side.position.set(x, 0.3575, -0.27);
    group.add(side);
  });
  const modesty = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 0.02), m.wood);
  modesty.position.set(0, 0.5, -0.6);
  group.add(modesty);
  return group;
}

// ---------- CRT monitor ----------

function roundedRectPath(path, w, h, r, cx = 0, cy = 0) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r);
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
  return path;
}

function buildMonitor(m, screenMaterial) {
  const group = new THREE.Group();
  group.position.set(0.11, 0.75, -0.38);
  group.rotation.y = -0.06;
  group.scale.setScalar(MONITOR_SCALE);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.12, 0.022, 40), m.plastic);
  base.scale.z = 0.85;
  base.position.y = 0.011;
  group.add(base);
  const neck = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.05, 0.13, 2, 0.01), m.plasticDark);
  neck.position.y = 0.045;
  group.add(neck);

  const head = new THREE.Group();
  head.position.y = 0.255;
  group.add(head);

  // Housing, tapered toward the back like a real tube.
  const housingGeo = new THREE.BoxGeometry(0.385, 0.355, 0.4, 1, 1, 1);
  const pos = housingGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getZ(i) < 0) {
      pos.setX(i, pos.getX(i) * 0.6);
      pos.setY(i, pos.getY(i) * 0.6 - 0.02);
    }
  }
  housingGeo.computeVertexNormals();
  const housing = new THREE.Mesh(housingGeo, m.plastic);
  housing.position.z = -0.01;
  head.add(housing);

  // Bezel with the screen opening.
  const outer = roundedRectPath(new THREE.Shape(), 0.4, 0.37, 0.022);
  outer.holes.push(roundedRectPath(new THREE.Path(), 0.312, 0.238, 0.014, 0, 0.018));
  const bezelGeo = new THREE.ExtrudeGeometry(outer, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.005,
    bevelSegments: 3,
    curveSegments: 10,
  });
  const bezel = new THREE.Mesh(bezelGeo, m.plastic);
  bezel.position.z = 0.19;
  head.add(bezel);

  // Dark tube surround visible in the recess.
  const surround = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.27), new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 0.4 }));
  surround.position.set(0, 0.018, 0.2);
  head.add(surround);

  // Curved glass.
  const glassGeo = new THREE.PlaneGeometry(0.33, 0.255, 48, 36);
  const gp = glassGeo.attributes.position;
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i) / 0.165;
    const y = gp.getY(i) / 0.1275;
    gp.setZ(i, 0.014 * (1 - 0.5 * x * x - 0.5 * y * y));
  }
  glassGeo.computeVertexNormals();
  const screen = new THREE.Mesh(glassGeo, screenMaterial);
  screen.position.set(0, 0.018, 0.205);
  head.add(screen);

  // Front details: power LED, button, knobs, badge.
  const ledMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x46ff7a).multiplyScalar(2.2) });
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, 0.003), ledMat);
  led.position.set(0.156, -0.152, 0.228);
  head.add(led);
  const button = new THREE.Mesh(new RoundedBoxGeometry(0.026, 0.012, 0.008, 2, 0.002), m.plasticDark);
  button.position.set(0.122, -0.152, 0.226);
  head.add(button);
  [-0.155, -0.128].forEach((x) => {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.008, 16), m.plasticDark);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(x, -0.152, 0.227);
    head.add(knob);
  });
  const badgeTex = canvasTexture(256, 48, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(70,62,48,0.85)';
    g.font = '700 30px Orbitron, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('AM · VGA 15', w / 2, h / 2 + 2);
  });
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.014), new THREE.MeshStandardMaterial({ map: badgeTex, transparent: true, roughness: 0.6 }));
  badge.position.set(0, -0.152, 0.2275);
  head.add(badge);

  const shadow = contactShadow(0.34, 0.32, 0.7);
  shadow.position.set(0, 0.001, 0);
  group.add(shadow);

  return { group, screen, ledMat };
}

// ---------- keyboard and mouse ----------

function buildKeyboard(m) {
  const group = new THREE.Group();
  group.position.set(0.09, 0.75, 0.0);
  group.rotation.set(0.05, -0.03, 0);

  const base = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.024, 0.17, 3, 0.006), m.plastic);
  base.position.y = 0.014;
  group.add(base);

  const u = 0.0186;
  const rows = [
    [1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
    [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
  ];
  const keys = [];
  const startX = -0.215;
  const startZ = -0.064;
  rows.forEach((row, r) => {
    let x = startX;
    const z = startZ + r * u + (r > 0 ? u * 0.35 : 0);
    row.forEach((w, i) => {
      const width = Math.abs(w) * u;
      if (w > 0) {
        const mod = w > 1.2 || (r === 0 && i === 0);
        keys.push({ x: x + width / 2, z, w: width - 0.0022, mod });
      }
      x += width;
    });
  });
  // Arrow cluster and numpad.
  for (let r = 1; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      keys.push({ x: 0.112 + c * u, z: startZ + r * u + u * 0.35, w: u - 0.0022, mod: c === 3 });
    }
  }
  [[0, 4], [-1, 5], [0, 5], [1, 5]].forEach(([c, r]) => {
    keys.push({ x: 0.075 + c * u, z: startZ + r * u + u * 0.35, w: u - 0.0022, mod: false });
  });

  const keyMesh = new THREE.InstancedMesh(
    new RoundedBoxGeometry(1, 1, 1, 1, 0.12),
    new THREE.MeshStandardMaterial({ roughness: 0.55 }),
    keys.length
  );
  const mat4 = new THREE.Matrix4();
  const light = new THREE.Color(0xddd5c1);
  const dark = new THREE.Color(0xa59c86);
  keys.forEach((k, i) => {
    mat4.compose(
      new THREE.Vector3(k.x, 0.031, k.z),
      new THREE.Quaternion(),
      new THREE.Vector3(k.w, 0.011, u - 0.0024)
    );
    keyMesh.setMatrixAt(i, mat4);
    keyMesh.setColorAt(i, k.mod ? dark : light);
  });
  group.add(keyMesh);

  const shadow = contactShadow(0.56, 0.24, 0.55);
  shadow.position.y = 0.001;
  group.add(shadow);
  return group;
}

function buildMouse(m) {
  const group = new THREE.Group();
  const pad = new THREE.Mesh(new RoundedBoxGeometry(0.21, 0.004, 0.19, 2, 0.002), new THREE.MeshStandardMaterial({ color: 0x1b2430, roughness: 0.95 }));
  pad.position.set(0.43, 0.752, -0.02);
  group.add(pad);

  const mouse = new THREE.Mesh(new RoundedBoxGeometry(0.058, 0.03, 0.1, 4, 0.014), m.plastic);
  mouse.position.set(0.43, 0.769, -0.005);
  mouse.rotation.y = 0.12;
  group.add(mouse);
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.0012, 0.002, 0.04), m.plasticDark);
  seam.position.set(0, 0.015, -0.03);
  mouse.add(seam);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.425, 0.768, -0.058),
    new THREE.Vector3(0.4, 0.758, -0.16),
    new THREE.Vector3(0.33, 0.756, -0.36),
    new THREE.Vector3(0.18, 0.756, -0.56),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.0024, 6), m.cable));

  const shadow = contactShadow(0.09, 0.14, 0.6);
  shadow.position.set(0.43, 0.7545, -0.005);
  group.add(shadow);
  return group;
}

// ---------- tower PC ----------

function buildTower(m) {
  const group = new THREE.Group();
  group.position.set(-0.5, 0.75, -0.32);
  group.rotation.y = 0.22;

  const W = 0.18;
  const H = 0.36;
  const D = 0.4;
  const px = (x, y) => [(x / 256 - 0.5) * W, H / 2 + (0.5 - y / 560) * H];

  const front = canvasTexture(256, 560, (g, w, h) => {
    g.fillStyle = '#cbbf9f';
    g.fillRect(0, 0, w, h);
    const bay = (y, height, slot) => {
      g.fillStyle = '#b9ad8d';
      g.fillRect(20, y, w - 40, height);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(20, y, w - 40, 2);
      if (slot) {
        g.fillStyle = '#2a2723';
        g.fillRect(44, y + height / 2 - 3, w - 110, 6);
        g.fillStyle = '#a89c7d';
        g.fillRect(w - 56, y + height / 2 - 7, 20, 14);
      }
    };
    bay(36, 70, true);
    bay(118, 70, false);
    bay(200, 46, true);
    g.fillStyle = 'rgba(60,52,40,0.9)';
    g.font = '700 22px Orbitron, sans-serif';
    g.textAlign = 'center';
    g.fillText('AM 486', w / 2, 300);
    g.font = '16px "Exo 2", sans-serif';
    g.fillText('TURBO', w / 2, 324);
    g.fillStyle = '#b2a687';
    g.fillRect(88, 380, 80, 44);
    g.strokeStyle = 'rgba(0,0,0,0.3)';
    g.strokeRect(88, 380, 80, 44);
    g.fillStyle = 'rgba(40,36,30,0.75)';
    g.font = '14px "Exo 2", sans-serif';
    g.textAlign = 'left';
    g.fillText('POWER', 76, 466);
    g.fillText('HDD', 76, 492);
    for (let y = 520; y < 552; y += 6) {
      g.fillStyle = 'rgba(0,0,0,0.2)';
      g.fillRect(24, y, w - 48, 2);
    }
  });
  const side = m.plastic;
  const box = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 2, 0.006), [side, side, side, side, new THREE.MeshStandardMaterial({ map: front, roughness: 0.6 }), side]);
  box.position.y = H / 2;
  group.add(box);

  const powerLed = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x46ff7a).multiplyScalar(2.4) });
  const hddLed = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffa529).multiplyScalar(2.4) });
  [[powerLed, 461], [hddLed, 487]].forEach(([mat, y]) => {
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, 0.002), mat);
    const [lx, ly] = px(60, y);
    led.position.set(lx, ly, D / 2 + 0.001);
    group.add(led);
  });

  const shadow = contactShadow(0.3, 0.52, 0.75);
  shadow.position.y = 0.001;
  group.add(shadow);
  return { group, hddLed, powerLed };
}

// ---------- floppy disks ----------

function buildFloppies() {
  const group = new THREE.Group();
  group.position.set(-0.27, 0.75, 0.05);
  group.rotation.y = 0.32;
  const disks = [
    { label: 'SOLAR.EXE', body: '#15171c' },
    { label: 'FINDSECURE', body: '#1f3d6b' },
    { label: 'MOODCAM', body: '#3b3f45' },
    { label: 'GEMINEAT', body: '#7a1f1a' },
  ];
  const rng = seeded(5);
  disks.reverse().forEach((disk, i) => {
    const top = canvasTexture(256, 266, (g, w, h) => {
      g.fillStyle = disk.body;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#b8bcc2';
      g.fillRect(64, 0, 128, 92);
      g.fillStyle = '#7d8187';
      g.fillRect(150, 14, 26, 64);
      g.fillStyle = '#efe9d8';
      g.fillRect(22, 124, w - 44, h - 140);
      g.strokeStyle = 'rgba(30,60,140,0.25)';
      for (let y = 160; y < h - 20; y += 22) {
        g.beginPath();
        g.moveTo(30, y);
        g.lineTo(w - 30, y);
        g.stroke();
      }
      g.fillStyle = '#1a2340';
      g.font = '34px "Permanent Marker", "Exo 2", sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.save();
      g.translate(w / 2, 186);
      g.rotate(-0.04 + rng() * 0.06);
      g.fillText(disk.label, 0, 0, w - 60);
      g.restore();
    });
    const sideMat = new THREE.MeshStandardMaterial({ color: disk.body, roughness: 0.45 });
    const topMat = new THREE.MeshStandardMaterial({ map: top, roughness: 0.5 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.0034, 0.094), [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);
    mesh.position.set((rng() - 0.5) * 0.012, 0.0017 + i * 0.0036, (rng() - 0.5) * 0.012);
    mesh.rotation.y = (rng() - 0.5) * 0.3;
    group.add(mesh);
  });
  const shadow = contactShadow(0.14, 0.14, 0.6);
  shadow.position.y = 0.0008;
  group.add(shadow);
  return group;
}

// ---------- poster ----------

function buildPoster() {
  const tex = canvasTexture(512, 728, (g, w, h) => {
    const rng = seeded(21);
    g.fillStyle = '#e6dcc3';
    g.fillRect(0, 0, w, h);
    const m = 26;
    const sky = g.createLinearGradient(0, m, 0, h - m);
    sky.addColorStop(0, '#0b1636');
    sky.addColorStop(1, '#1c1012');
    g.fillStyle = sky;
    g.fillRect(m, m, w - m * 2, h - m * 2);
    for (let i = 0; i < 160; i++) {
      g.fillStyle = `rgba(255,240,210,${0.3 + rng() * 0.6})`;
      const s = rng() > 0.92 ? 3 : 1.5;
      g.fillRect(m + rng() * (w - m * 2), m + rng() * (h - m * 2) * 0.7, s, s);
    }
    const cx = w * 0.58;
    const cy = h * 0.6;
    const r = 150;
    const ring = (front) => {
      g.save();
      g.translate(cx, cy);
      g.rotate(-0.32);
      g.beginPath();
      g.ellipse(0, 0, r * 1.95, r * 0.48, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
      g.strokeStyle = '#e8c48a';
      g.lineWidth = 22;
      g.stroke();
      g.strokeStyle = 'rgba(40,20,10,0.5)';
      g.lineWidth = 3;
      g.stroke();
      g.restore();
    };
    ring(false);
    const body = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    body.addColorStop(0, '#f6d49a');
    body.addColorStop(0.5, '#d98a3d');
    body.addColorStop(1, '#5a2414');
    g.fillStyle = body;
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.clip();
    for (let i = -6; i < 7; i++) {
      g.fillStyle = i % 2 ? 'rgba(120,50,20,0.18)' : 'rgba(255,230,180,0.12)';
      g.fillRect(cx - r, cy + i * 22, r * 2, 11);
    }
    g.restore();
    ring(true);
    g.fillStyle = '#f2e6c9';
    g.font = '900 86px Orbitron, sans-serif';
    g.textAlign = 'center';
    g.fillText('SATURN', w / 2, 140);
    g.font = '600 18px "Exo 2", sans-serif';
    g.letterSpacing = '6px';
    g.fillStyle = '#e8c48a';
    g.fillText('6TH PLANET FROM THE SUN', w / 2, 178);
    // Paper wear.
    speckle(g, w, h, 1800, rng, ['rgba(80,60,30,0.08)', 'rgba(255,255,255,0.05)'], 2);
  });
  const group = new THREE.Group();
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.6), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
  group.add(poster);
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0xd9cfae, roughness: 0.6, transparent: true, opacity: 0.75 });
  [[-0.19, 0.28, 0.6], [0.19, 0.28, -0.6]].forEach(([x, y, r]) => {
    const tape = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.022), tapeMat);
    tape.position.set(x, y, 0.001);
    tape.rotation.z = r;
    group.add(tape);
  });
  group.position.set(-0.82, 1.03, WALL_Z + 0.004);
  group.rotation.z = 0.015;
  return group;
}

// ---------- rain window ----------

function createRainMaterial(aspect) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAspect: { value: aspect } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uAspect;
      varying vec2 vUv;

      float hash(vec2 p) { p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }

      vec3 city(vec2 uv) {
        vec3 col = mix(vec3(0.035, 0.03, 0.03), vec3(0.008, 0.012, 0.02), smoothstep(0.0, 0.9, uv.y));
        col += vec3(0.09, 0.045, 0.012) * smoothstep(0.55, 0.0, uv.y);
        for (int layer = 0; layer < 3; layer++) {
          float fl = float(layer);
          float scale = 4.0 + fl * 3.0;
          vec2 g = uv * vec2(scale * uAspect, scale) + vec2(fl * 3.7, fl * 1.3);
          vec2 id = floor(g);
          vec2 f = fract(g) - 0.5;
          float h = hash(id + fl * 13.1);
          float lower = step(id.y, scale * 0.5);
          if (h > 0.5 && lower > 0.5) {
            vec2 off = (vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5) * 0.5;
            float r = 0.32 + 0.16 * hash(id + 3.3);
            float d = length(f - off);
            // Out-of-focus disc: soft body, slightly brighter rim.
            float disk = smoothstep(r, r * 0.2, d);
            disk = disk * disk * (0.8 + 0.4 * smoothstep(r * 0.5, r * 0.9, d));
            vec3 c = h > 0.86 ? vec3(0.45, 0.62, 0.9) : (h > 0.74 ? vec3(1.0, 0.82, 0.55) : vec3(1.0, 0.5, 0.14));
            float twinkle = 0.88 + 0.12 * sin(uTime * 0.6 + h * 40.0);
            col += c * disk * (0.05 + 0.1 * hash(id + 9.0)) * (1.0 - fl * 0.25) * twinkle;
          }
        }
        return col;
      }

      void main() {
        vec2 uv = vUv;
        vec2 p = uv * vec2(uAspect, 1.0);
        vec2 offset = vec2(0.0);
        float drops = 0.0;

        // Static beads on the glass.
        vec2 g = p * 18.0;
        vec2 id = floor(g);
        vec2 f = fract(g) - 0.5;
        float h = hash(id);
        vec2 c = (vec2(hash(id + 3.1), hash(id + 5.7)) - 0.5) * 0.6;
        float r = 0.1 + 0.14 * h;
        float d = length(f - c);
        float bead = smoothstep(r, r * 0.3, d) * step(0.5, h);
        offset += (f - c) * bead * 0.09;
        drops += bead;

        // Sliding drops leaving wet trails.
        float colId = floor(p.x * 7.0);
        float ch = hash(vec2(colId, 2.0));
        float speed = 0.05 + 0.1 * ch;
        float y = fract(uv.y + uTime * speed + ch * 10.0);
        float x = fract(p.x * 7.0) - 0.5 + sin(uv.y * 24.0 + ch * 6.0) * 0.07;
        float head = smoothstep(0.16, 0.0, length(vec2(x * 1.3, (y - 0.06) * 5.0)));
        float trail = smoothstep(0.06, 0.0, abs(x)) * smoothstep(0.06, 0.5, y) * (1.0 - y) * 0.9;
        float slide = (head + trail) * step(0.25, ch);
        offset += vec2(x, -0.5) * slide * 0.05;
        drops += slide;

        vec3 colr = city(uv + offset);
        // Water catches the city light: brighter, cooler highlights on drops.
        colr += drops * vec3(0.06, 0.065, 0.075);
        colr += head * step(0.25, ch) * vec3(0.08, 0.075, 0.07);
        gl_FragColor = vec4(colr, 1.0);
      }
    `,
  });
}

function buildWindow(m, win) {
  const group = new THREE.Group();
  const w = win.x1 - win.x0;
  const h = win.y1 - win.y0;
  const cx = (win.x0 + win.x1) / 2;
  const cy = (win.y0 + win.y1) / 2;
  const depth = 0.12;

  const rain = createRainMaterial(w / h);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), rain);
  glass.position.set(cx, cy, WALL_Z - depth + 0.02);
  group.add(glass);

  const reveal = (rw, rh, x, y, z, rot) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(rw, rh), m.wall);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rot[0], rot[1], 0);
    group.add(mesh);
  };
  const zMid = WALL_Z - depth / 2;
  reveal(depth, h, win.x0, cy, zMid, [0, Math.PI / 2]);
  reveal(depth, h, win.x1, cy, zMid, [0, -Math.PI / 2]);
  reveal(w, depth, cx, win.y1, zMid, [Math.PI / 2, 0]);

  const frameDepth = 0.04;
  const bar = (bw, bh, x, y) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, frameDepth), m.trim);
    mesh.position.set(x, y, WALL_Z - depth + 0.04);
    group.add(mesh);
  };
  const t = 0.035;
  bar(w, t, cx, win.y0 + t / 2);
  bar(w, t, cx, win.y1 - t / 2);
  bar(t, h, win.x0 + t / 2, cy);
  bar(t, h, win.x1 - t / 2, cy);
  bar(0.022, h, cx, cy);
  bar(w, 0.022, cx, cy + 0.06);

  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.025, depth + 0.06), m.trim);
  sill.position.set(cx, win.y0 - 0.012, WALL_Z - depth / 2 + 0.03);
  group.add(sill);

  // Venetian blinds, half lowered.
  const slats = 13;
  const slatMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(w - 0.02, 0.0018, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x9c968a, roughness: 0.6 }),
    slats
  );
  const mat4 = new THREE.Matrix4();
  for (let i = 0; i < slats; i++) {
    mat4.compose(
      new THREE.Vector3(cx, win.y1 - 0.03 - i * 0.022, WALL_Z - 0.03),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0.55, 0, 0)),
      new THREE.Vector3(1, 1, 1)
    );
    slatMesh.setMatrixAt(i, mat4);
  }
  group.add(slatMesh);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(w - 0.01, 0.012, 0.035), new THREE.MeshStandardMaterial({ color: 0x8d877b, roughness: 0.6 }));
  rail.position.set(cx, win.y1 - 0.035 - slats * 0.022, WALL_Z - 0.03);
  group.add(rail);

  return { group, rain };
}

// ---------- neon signs ----------

function neonTextures(w, h, draw, color) {
  const hex = `#${color.getHexString()}`;
  const lit = canvasTexture(w, h, (g) => {
    g.clearRect(0, 0, w, h);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.shadowColor = hex;
    g.shadowBlur = w / 90;
    draw(g, hex, 1);
    g.shadowBlur = 0;
    g.globalAlpha = 0.8;
    draw(g, '#fff4ee', 0.45);
  });
  const off = canvasTexture(w, h, (g) => {
    g.clearRect(0, 0, w, h);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    draw(g, 'rgba(70, 64, 62, 0.9)', 1);
    g.globalAlpha = 0.5;
    draw(g, 'rgba(180, 170, 165, 0.6)', 0.25);
  });
  return { lit, off };
}

function neonSign(width, height, textures, color) {
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(width, height);
  const tube = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: textures.off, transparent: true, roughness: 0.35, depthWrite: false }));
  group.add(tube);
  const glowMat = new THREE.MeshBasicMaterial({
    map: textures.lit,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: color.clone().multiplyScalar(1.55),
  });
  const glow = new THREE.Mesh(geo, glowMat);
  glow.position.z = 0.002;
  group.add(glow);
  return { group, glowMat, base: color.clone().multiplyScalar(1.55) };
}

function buildNeons() {
  const word = (text) => neonTextures(1024, 256, (g, fill, scale) => {
    g.font = '400 190px "Tilt Neon", "Exo 2", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = fill;
    g.fillText(text, 512, 138);
  }, NEON_PINK);

  const hello = neonSign(0.52, 0.13, word('HELLO'), NEON_PINK);
  hello.group.position.set(-0.42, 1.56, WALL_Z + 0.03);
  const world = neonSign(0.52, 0.13, word('WORLD'), NEON_PINK);
  world.group.position.set(-0.42, 1.42, WALL_Z + 0.03);

  // Saturn, drawn large and simple so it reads at a glance: a whole planet
  // outline broken only where the ring's front crosses it, and a flat ring
  // whose back half disappears behind the planet.
  const saturnTex = neonTextures(1024, 640, (g, stroke, scale) => {
    const cx = 512;
    const cy = 320;
    const r = 150;
    const rx = r * 2.05;
    const ry = r * 0.4;
    const tilt = -0.2;
    const gap = 0.2;
    // Where the ring ellipse meets the planet circle: x² + y² = r², x²/rx² + y²/ry² = 1.
    const crossX = Math.sqrt((r * r - ry * ry) / (1 - (ry * ry) / (rx * rx)));
    const crossY = Math.sqrt(Math.max(0, r * r - crossX * crossX));
    const alpha = Math.acos(crossX / rx);
    // Planet outline, broken where the ring's front passes over it.
    const a1 = Math.atan2(crossY, crossX) + tilt;
    const a2 = Math.atan2(crossY, -crossX) + tilt;
    g.strokeStyle = stroke;
    g.lineWidth = 26 * scale + 4;
    g.beginPath();
    g.arc(cx, cy, r, a1 + gap, a2 - gap);
    g.stroke();
    g.beginPath();
    g.arc(cx, cy, r, a2 + gap, a1 + Math.PI * 2 - gap);
    g.stroke();
    g.save();
    g.translate(cx, cy);
    g.rotate(tilt);
    // Front half of the ring (lower on the canvas) crosses in front of the planet.
    g.beginPath();
    g.ellipse(0, 0, rx, ry, 0, 0, Math.PI);
    g.stroke();
    // Back half: only the two ends that stick out beyond the planet.
    g.beginPath();
    g.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI + alpha - 0.08);
    g.stroke();
    g.beginPath();
    g.ellipse(0, 0, rx, ry, 0, Math.PI * 2 - alpha + 0.08, Math.PI * 2);
    g.stroke();
    g.restore();
  }, NEON_CYAN);
  const saturn = neonSign(0.52, 0.325, saturnTex, NEON_CYAN);
  saturn.group.position.set(0.7, 1.55, WALL_Z + 0.03);
  saturn.group.rotation.z = 0.04;

  // Mounting standoffs ride with each sign, so a sign can move as one object.
  const standoffMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.3 });
  const mount = (sign, points) => points.forEach(([x, y]) => {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8), standoffMat);
    st.rotation.x = Math.PI / 2;
    st.position.set(x, y, -0.015);
    sign.group.add(st);
  });
  mount(hello, [[-0.22, 0.05], [0.22, 0.05]]);
  mount(world, [[-0.22, -0.05], [0.22, -0.05]]);
  mount(saturn, [[-0.16, -0.06], [0.16, 0.06]]);
  const standoffs = new THREE.Group();

  return { hello, world, saturn, standoffs };
}

// ---------- radio ----------

// A dark 90s portable stereo: two grilles, an amber dot-matrix display
// (vacuum-fluorescent style, period-correct), and three physical buttons.
// Backlit touch keys in the display's amber: dark glass, glowing pictogram.
const RADIO_AMBER = '#ffb347';
function digitalKey(draw) {
  return canvasTexture(120, 64, (g, w, h) => {
    g.fillStyle = '#140b03';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = RADIO_AMBER;
    g.lineWidth = 3;
    g.shadowColor = RADIO_AMBER;
    g.shadowBlur = 6;
    g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = RADIO_AMBER;
    draw(g, w, h);
    g.shadowBlur = 0;
    // Same dot-matrix grain as the display.
    g.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h);
  });
}

const RADIO_ICONS = {
  play: (g, w, h) => {
    g.beginPath();
    g.moveTo(w / 2 - 11, h / 2 - 15);
    g.lineTo(w / 2 + 15, h / 2);
    g.lineTo(w / 2 - 11, h / 2 + 15);
    g.closePath();
    g.fill();
  },
  pause: (g, w, h) => {
    g.fillRect(w / 2 - 14, h / 2 - 14, 9, 28);
    g.fillRect(w / 2 + 5, h / 2 - 14, 9, 28);
  },
  next: (g, w, h) => {
    [-18, -3].forEach((dx) => {
      g.beginPath();
      g.moveTo(w / 2 + dx, h / 2 - 13);
      g.lineTo(w / 2 + dx + 15, h / 2);
      g.lineTo(w / 2 + dx, h / 2 + 13);
      g.closePath();
      g.fill();
    });
    g.fillRect(w / 2 + 13, h / 2 - 13, 5, 26);
  },
};

function buildRadio(m) {
  const group = new THREE.Group();
  group.position.set(0.61, 0.75, -0.37);
  group.rotation.y = -0.36;
  const W = 0.31;
  const H = 0.14;
  const D = 0.085;
  const front = D / 2;

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2c31, roughness: 0.48, metalness: 0.05 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 3, 0.014), bodyMat);
  body.position.y = H / 2;
  group.add(body);

  // Speaker grilles: punched metal over the cones.
  const grilleTex = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#26282c';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#060607';
    for (let y = 8; y < h; y += 14) {
      for (let x = (y / 14) % 2 ? 8 : 15; x < w; x += 14) {
        g.beginPath();
        g.arc(x, y, 4.2, 0, Math.PI * 2);
        g.fill();
      }
    }
  });
  const grilleMat = new THREE.MeshStandardMaterial({ map: grilleTex, roughness: 0.6, metalness: 0.5 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x9a9da3, roughness: 0.3, metalness: 0.85 });
  const grilles = [-1, 1].map((side) => {
    const holder = new THREE.Group();
    holder.position.set(side * 0.105, H / 2 - 0.004, front + 0.0012);
    const grille = new THREE.Mesh(new THREE.CircleGeometry(0.043, 40), grilleMat);
    holder.add(grille);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0445, 0.0028, 8, 40), ringMat);
    holder.add(ring);
    group.add(holder);
    return grille;
  });

  // Display window.
  const displayCanvas = document.createElement('canvas');
  displayCanvas.width = 512;
  displayCanvas.height = 192;
  const displayTex = new THREE.CanvasTexture(displayCanvas);
  displayTex.colorSpace = THREE.SRGBColorSpace;
  displayTex.anisotropy = 8;
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.05), new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.3 }));
  bezel.position.set(0, H / 2 + 0.024, front + 0.001);
  group.add(bezel);
  const displayMat = new THREE.MeshBasicMaterial({ map: displayTex, color: new THREE.Color(1.15, 1.15, 1.15) });
  const display = new THREE.Mesh(new THREE.PlaneGeometry(0.102, 0.038), displayMat);
  display.position.set(0, H / 2 + 0.024, front + 0.0016);
  group.add(display);

  // Small print above the display.
  const printTex = canvasTexture(256, 32, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(200, 200, 205, 0.75)';
    g.font = '600 20px "Exo 2", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('AM SOUND  ·  STEREO', w / 2, h / 2 + 1);
  });
  const print = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.009), new THREE.MeshBasicMaterial({ map: printTex, transparent: true }));
  print.position.set(0, H - 0.012, front + 0.0012);
  group.add(print);

  // Two digital keys under the display: play/pause, and next. Same size as
  // before, glowing in the display's amber so they read in the dark.
  const keyTextures = { play: digitalKey(RADIO_ICONS.play), pause: digitalKey(RADIO_ICONS.pause), next: digitalKey(RADIO_ICONS.next) };
  const keyBase = new THREE.Color(1.25, 1.25, 1.25);
  const buttons = ['toggle', 'next'].map((action, i) => {
    const face = new THREE.MeshBasicMaterial({ map: action === 'toggle' ? keyTextures.play : keyTextures.next, color: keyBase.clone() });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.016), face);
    mesh.position.set((i - 0.5) * 0.04, H / 2 - 0.026, front + 0.0016);
    mesh.userData = { radioAction: action };
    group.add(mesh);
    // Recessed bezel around each key.
    const bezelKey = new THREE.Mesh(new THREE.PlaneGeometry(0.034, 0.02), new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.3 }));
    bezelKey.position.set(mesh.position.x, mesh.position.y, front + 0.001);
    group.add(bezelKey);
    return mesh;
  });

  // Power LED.
  const ledMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff3b2f).multiplyScalar(0.08) });
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.0022, 12), ledMat);
  led.position.set(-0.064, H / 2 + 0.024, front + 0.0014);
  group.add(led);

  // Carry handle.
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.125, H - 0.004, 0),
    new THREE.Vector3(-0.115, H + 0.036, 0),
    new THREE.Vector3(0.115, H + 0.036, 0),
    new THREE.Vector3(0.125, H - 0.004, 0),
  ], false, 'catmullrom', 0.2);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 40, 0.0055, 10), bodyMat));

  // Telescopic antenna.
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0026, 0.26, 8), ringMat);
  antenna.position.set(0.12, H + 0.11, -0.02);
  antenna.rotation.z = -0.42;
  antenna.rotation.x = -0.15;
  group.add(antenna);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 10, 8), ringMat);
  tip.position.set(0.12 + Math.sin(0.42) * 0.13, H + 0.11 + Math.cos(0.42) * 0.13, -0.04);
  group.add(tip);

  const shadow = contactShadow(0.4, 0.16, 0.7);
  shadow.position.y = 0.001;
  group.add(shadow);

  return { group, buttons, keyTextures, keyBase, grilles, ledMat, display: { canvas: displayCanvas, ctx: displayCanvas.getContext('2d'), texture: displayTex } };
}

// Amber dot-matrix: state + track number, the scrolling song, a VU meter.
function drawRadioDisplay(radio, info, et) {
  const { ctx, canvas, texture } = radio.display;
  const w = canvas.width;
  const h = canvas.height;
  const AMBER = '#ffb347';
  const text = info.status === 'empty'
    ? info.emptyText
    : `${info.artist ? `${info.artist} - ` : ''}${info.title}`.toUpperCase();
  ctx.font = '78px VT323, monospace';
  const textW = ctx.measureText(text).width;
  const scrolls = textW > w - 40;
  const offset = scrolls ? Math.floor((et * 70) % (textW + 120)) : 0;
  const vu = Math.round((info.level || 0) * 10);
  const key = `${text}|${info.status}|${info.index}|${info.total}|${offset}|${vu}`;
  if (key === radio.lastKey) return;
  radio.lastKey = key;

  ctx.fillStyle = '#120902';
  ctx.fillRect(0, 0, w, h);
  ctx.shadowColor = AMBER;
  ctx.shadowBlur = 8;
  ctx.fillStyle = AMBER;

  // Row 1: state, track number.
  const on = info.status === 'playing' || info.status === 'pending';
  if (on) {
    ctx.beginPath();
    ctx.moveTo(22, 18);
    ctx.lineTo(46, 32);
    ctx.lineTo(22, 46);
    ctx.closePath();
    ctx.fill();
  } else if (info.status === 'paused') {
    ctx.fillRect(22, 19, 9, 26);
    ctx.fillRect(38, 19, 9, 26);
  }
  ctx.font = '44px VT323, monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  if (info.total) ctx.fillText(`${String(info.index + 1).padStart(2, '0')}/${String(info.total).padStart(2, '0')}`, w - 20, 33);
  ctx.textAlign = 'left';
  ctx.fillText(on ? 'PLAY' : info.status === 'paused' ? 'PAUSE' : '', 62, 33);

  // Row 2: the song, scrolling when it does not fit.
  ctx.save();
  ctx.beginPath();
  ctx.rect(14, 62, w - 28, 76);
  ctx.clip();
  ctx.font = '78px VT323, monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  if (scrolls) {
    ctx.fillText(text, 20 - offset, 100);
    ctx.fillText(text, 20 - offset + textW + 120, 100);
  } else {
    ctx.textAlign = 'center';
    ctx.fillText(text, w / 2, 100);
  }
  ctx.restore();

  // Row 3: VU bars.
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i < vu ? AMBER : '#3a2208';
    ctx.shadowBlur = i < vu ? 8 : 0;
    ctx.fillRect(22 + i * 30, 152, 22, 22);
  }
  ctx.shadowBlur = 0;

  // Dot-matrix grain and unlit cells.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
  for (let x = 0; x < w; x += 4) ctx.fillRect(x, 0, 1, h);
  texture.needsUpdate = true;
}

// ---------- assemble ----------

export function createRoomScene({ desktopTexture, solarTexture }) {
  RectAreaLightUniformsLib.init();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020304);
  scene.fog = new THREE.Fog(0x020304, 3.5, 7);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 30);

  const m = createMaterials();
  const win = { x0: 0.44, x1: 0.98, y0: 0.8, y1: 1.34 };

  scene.add(buildShell(m, win));
  scene.add(buildDesk(m));

  const screenMaterial = createCrtScreenMaterial({ desktopTexture, solarTexture });
  const monitor = buildMonitor(m, screenMaterial);
  scene.add(monitor.group);
  scene.add(buildKeyboard(m));
  scene.add(buildMouse(m));
  const tower = buildTower(m);
  scene.add(tower.group);
  scene.add(buildFloppies());
  scene.add(buildPoster());
  const windowParts = buildWindow(m, win);
  scene.add(windowParts.group);
  const radio = buildRadio(m);
  scene.add(radio.group);
  const neons = buildNeons();
  scene.add(neons.hello.group, neons.world.group, neons.saturn.group, neons.standoffs);

  // Monitor cables down the back of the desk.
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, 0.95, -0.6),
    new THREE.Vector3(0.02, 0.8, -0.63),
    new THREE.Vector3(-0.05, 0.6, -0.64),
    new THREE.Vector3(-0.2, 0.3, -0.645),
  ]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 30, 0.006, 6), m.cable));

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0x1b2a33, 0x080605, 0.35));

  // In front of the bezel, so it lights the desk and keyboard, not the recess walls.
  const screenLight = new THREE.RectAreaLight(0x9fb6ff, 6, 0.3, 0.23);
  monitor.screen.add(screenLight);
  screenLight.position.set(0, 0, 0.04);
  screenLight.rotation.y = Math.PI; // area lights emit along their local -Z


  const neonRedLight = new THREE.PointLight(NEON_PINK, 0.75, 3, 2);
  neonRedLight.position.set(-0.42, 1.49, WALL_Z + 0.16);
  scene.add(neonRedLight);

  const neonCyanLight = new THREE.PointLight(NEON_CYAN, 0.5, 3, 2);
  neonCyanLight.position.set(0.7, 1.55, WALL_Z + 0.16);
  scene.add(neonCyanLight);

  const windowLight = new THREE.RectAreaLight(0x5b8fd6, 1.6, win.x1 - win.x0, win.y1 - win.y0);
  windowLight.position.set((win.x0 + win.x1) / 2, (win.y0 + win.y1) / 2, WALL_Z - 0.05);
  windowLight.lookAt(windowLight.position.x, windowLight.position.y, 2);
  scene.add(windowLight);

  // Soft fill from behind the visitor so object fronts read.
  const fill = new THREE.PointLight(0xffc8a0, 0.9, 4, 2);
  fill.position.set(0, 1.25, 1.45);
  scene.add(fill);

  const interactive = [monitor.screen, monitor.group];

  // ---------- flicker ----------
  const rng = Math.random;
  const worldTube = { burstUntil: 0, nextBurst: 2.5 + rng() * 3 };
  const saturnTube = { dipUntil: 0, nextDip: 8 + rng() * 6 };
  let hddLevel = 0;

  let radioLevel = 0;
  const pressed = new Map();
  function pressRadioButton(action) {
    pressed.set(action, performance.now());
  }

  function update(dt, et, { loading = false, power = 1, screenBright = 1, reducedMotion = false, computerOn = true, radioInfo = null } = {}) {
    if (radioInfo) {
      radioLevel += ((radioInfo.level || 0) - radioLevel) * Math.min(1, dt * 18);
      drawRadioDisplay(radio, { ...radioInfo, level: radioLevel }, et);
      const radioOn = radioInfo.status === 'playing' || radioInfo.status === 'pending';
      radio.ledMat.color.setHex(0xff3b2f).multiplyScalar(radioOn ? 1.6 : 0.08);
      // The toggle key shows what pressing it will do.
      radio.buttons[0].material.map = radioOn ? radio.keyTextures.pause : radio.keyTextures.play;
      const bounce = reducedMotion ? 1 : 1 + radioLevel * 0.035;
      radio.grilles.forEach((g) => g.scale.setScalar(bounce));
    }
    const now = performance.now();
    radio.buttons.forEach((b) => {
      // A press flashes the key brighter, then it settles back.
      const at = pressed.get(b.userData.radioAction);
      const flash = at ? Math.max(0, 1 - (now - at) / 220) : 0;
      b.material.color.copy(radio.keyBase).multiplyScalar(1 + flash * 0.9);
    });

    windowParts.rain.uniforms.uTime.value = et;
    screenMaterial.uniforms.uTime.value = et;

    let helloLevel = 1;
    let worldLevel = 1;
    let saturnLevel = 1;
    if (!reducedMotion) {
      helloLevel = 0.96 + 0.04 * hashStep(et, 30, 1);
      if (et > worldTube.nextBurst && et > worldTube.burstUntil) {
        worldTube.burstUntil = et + 0.4 + rng() * 0.6;
        worldTube.nextBurst = worldTube.burstUntil + 4 + rng() * 7;
      }
      worldLevel = et < worldTube.burstUntil
        ? (hashStep(et, 16, 2) > 0.45 ? 1 : 0.04 + hashStep(et, 40, 3) * 0.2)
        : 0.95 + 0.05 * hashStep(et, 24, 4);
      if (et > saturnTube.nextDip && et > saturnTube.dipUntil) {
        saturnTube.dipUntil = et + 0.12 + rng() * 0.1;
        saturnTube.nextDip = saturnTube.dipUntil + 9 + rng() * 8;
      }
      saturnLevel = et < saturnTube.dipUntil ? 0.35 : 0.92 + 0.05 * Math.sin(et * 2.1) + 0.03 * hashStep(et, 50, 5);
    }

    neons.hello.glowMat.color.copy(neons.hello.base).multiplyScalar(helloLevel);
    neons.world.glowMat.color.copy(neons.world.base).multiplyScalar(worldLevel);
    neons.saturn.glowMat.color.copy(neons.saturn.base).multiplyScalar(saturnLevel);
    neonRedLight.intensity = 0.75 * (helloLevel * 0.5 + worldLevel * 0.5);
    neonCyanLight.intensity = 0.5 * saturnLevel;

    // Drive LED chatters while the program loads, otherwise blinks now and then.
    const target = loading ? (hashStep(et, 22, 6) > 0.4 ? 1 : 0) : (hashStep(et, 3, 7) > 0.93 ? 1 : 0);
    hddLevel += (target - hddLevel) * Math.min(1, dt * 30);
    tower.hddLed.color.setHex(0xffa529).multiplyScalar(computerOn ? 0.15 + hddLevel * 2.3 : 0.05);
    // Power LEDs follow the machine: dark until it boots.
    const ledLevel = computerOn ? 2.3 : 0.06;
    monitor.ledMat.color.setHex(0x46ff7a).multiplyScalar(ledLevel);
    tower.powerLed.color.setHex(0x46ff7a).multiplyScalar(ledLevel);

    screenLight.intensity = 6 * power * screenBright;
  }

  // World-space frame of the visible picture on the glass, for the camera dive.
  function getScreenFrame() {
    monitor.screen.updateWorldMatrix(true, false);
    const center = new THREE.Vector3(0, 0, 0.014).applyMatrix4(monitor.screen.matrixWorld);
    const normal = new THREE.Vector3(0, 0, 1).transformDirection(monitor.screen.matrixWorld);
    return { center, normal, halfW: (0.33 / 2 / 1.16) * MONITOR_SCALE, halfH: (0.255 / 2 / 1.16) * MONITOR_SCALE };
  }

  // Portrait screens cannot hold 1.6 m of wall without showing the floor, so the
  // two signs gather closer together above the desk there.
  const LAYOUTS = {
    landscape: { hello: [-0.42, 1.56], world: [-0.42, 1.42], saturn: [0.7, 1.55] },
    portrait: { hello: [-0.22, 1.62], world: [-0.22, 1.48], saturn: [0.43, 1.63] },
  };
  function setLayout(name) {
    const l = LAYOUTS[name] || LAYOUTS.landscape;
    neons.hello.group.position.set(l.hello[0], l.hello[1], WALL_Z + 0.03);
    neons.world.group.position.set(l.world[0], l.world[1], WALL_Z + 0.03);
    neons.saturn.group.position.set(l.saturn[0], l.saturn[1], WALL_Z + 0.03);
    neonRedLight.position.set(l.hello[0], (l.hello[1] + l.world[1]) / 2, WALL_Z + 0.16);
    neonCyanLight.position.set(l.saturn[0], l.saturn[1], WALL_Z + 0.16);
  }

  return {
    scene,
    camera,
    setLayout,
    screenMaterial,
    interactive,
    radioButtons: radio.buttons,
    pressRadioButton,
    screenMesh: monitor.screen,
    getScreenFrame,
    update,
  };
}
