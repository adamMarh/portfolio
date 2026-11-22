import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { mountPortfolioSolarSystem } from '../solar/portfolioRuntime.js';
import { createDesktopScreen } from './desktopScreen.js';
import { createRoomScene } from './roomScene.js';
import { createCrtPassShader, createGradePassShader } from './crtShader.js';
import { stage, setStage, prefersReducedMotion, markStageMounted } from './state.js';
import { globalEventBus } from '../../utils/eventBus.js';
import { getTranslation, getProjectTranslation } from '../../i18n/translations.js';
import { PROJECTS } from '../../data/portfolio.js';
import cursorImage from '../../assets/cursors1.png';
import { getLevel, getRadioState, radioCommand } from '../radio/radioPlayer.js';
import { fadeOutSfx, playSfx, preloadSfx } from '../audio/sfx.js';

const SITE_FOV = 55;
const ROOM_FOV = 50;
// Seated in front of the desk; the CRT sits a little right of centre.
const SEAT = new THREE.Vector3(-0.02, 1.2, 0.85);
const LOOK = new THREE.Vector3(0.05, 1.1, -0.5);
const WALL_Z = -0.66;
const DIVE_MS = 1800;
const REVEAL_MS = 1100;
const PULLBACK_MS = 1500;

// cubic-bezier(0.77, 0, 0.175, 1): strong ease-in-out for camera moves.
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const dx = sampleX(t) - x;
      const d = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(dx) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}
const easeCamera = bezier(0.77, 0, 0.175, 1);
const easeOut = bezier(0.16, 1, 0.3, 1);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function loadFonts() {
  const fonts = ['26px VT323', '190px "Tilt Neon"', '34px "Permanent Marker"', '700 30px Orbitron', '900 86px Orbitron', '600 18px "Exo 2"'];
  const all = Promise.all(fonts.map((f) => document.fonts.load(f).catch(() => null)));
  return Promise.race([all, new Promise((resolve) => setTimeout(resolve, 3000))]);
}

function setupFakeCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const fakeCursor = document.createElement('div');
  fakeCursor.id = 'fake-cursor';
  fakeCursor.style.backgroundImage = `url('${cursorImage}')`;
  document.body.appendChild(fakeCursor);
  document.body.classList.add('custom-cursor-enabled');
  document.addEventListener('pointermove', (e) => {
    fakeCursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  }, { passive: true });
}

export async function mountStage() {
  const canvas = document.getElementById('canvas');
  setupFakeCursor();
  await loadFonts();

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(W(), H());
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const solar = mountPortfolioSolarSystem({ renderer, canvas });

  let language = localStorage.getItem('portfolio-language') || 'fr';
  const getStrings = () => ({
    lang: language,
    menu: getTranslation(language, 'room.screen.menu'),
    portfolio: getTranslation(language, 'room.screen.portfolio'),
    paint: getTranslation(language, 'room.screen.paint'),
    paintTitle: getTranslation(language, 'room.screen.paintTitle'),
    encyclopedia: getTranslation(language, 'room.screen.encyclopedia'),
    encyclopediaTitle: getTranslation(language, 'room.screen.encyclopediaTitle'),
    funFacts: getTranslation(language, 'room.screen.funFacts'),
    inSolar: getTranslation(language, 'room.screen.inSolar'),
    // Which part of the portfolio each body holds, for the encyclopedia.
    bodyTitles: Object.fromEntries([
      ['Soleil', getTranslation(language, 'profile.title')],
      ...PROJECTS.map((project, i) => [project.planet, getProjectTranslation(language, i)?.title]),
    ]),
    loading: getTranslation(language, 'room.screen.loading'),
    role: getTranslation(language, 'room.screen.role'),
  });

  const solarRT = new THREE.WebGLRenderTarget(1024, 768, { type: THREE.HalfFloatType, samples: 4 });
  const desktop = createDesktopScreen({ getStrings });
  const room = createRoomScene({ desktopTexture: desktop.texture, solarTexture: solarRT.texture });
  desktop.on('solarStart', () => solar.playIntro());
  desktop.on('portfolioReady', () => startDive());
  desktop.on('stateChange', () => announceDesk());
  desktop.on('click', () => playSfx('click'));
  preloadSfx();

  // ---------- composers ----------
  const roomComposer = new EffectComposer(renderer);
  roomComposer.addPass(new RenderPass(room.scene, room.camera));
  const BLOOM = 0.55;
  const bloom = new UnrealBloomPass(new THREE.Vector2(W(), H()), BLOOM, 0.4, 0.9);
  roomComposer.addPass(bloom);
  const grade = new ShaderPass(createGradePassShader());
  roomComposer.addPass(grade);
  roomComposer.addPass(new OutputPass());

  // The live site keeps the glow the CRT promised: same bloom family as the room.
  const siteComposer = new EffectComposer(renderer);
  siteComposer.addPass(new RenderPass(solar.scene, solar.camera));
  const siteBloom = new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.75, 0.6, 0.78);
  siteComposer.addPass(siteBloom);
  const crtPass = new ShaderPass(createCrtPassShader());
  siteComposer.addPass(crtPass);
  siteComposer.addPass(new OutputPass());

  // ---------- room camera ----------
  const roomCam = room.camera;
  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0, hover: 0 };
  const seatBase = SEAT.clone();
  const lookBase = LOOK.clone();
  let hovering = false;
  const look = LOOK.clone();
  let viewShift = 0;
  const raycaster = new THREE.Raycaster();

  function frameRoomCamera() {
    const aspect = W() / H();
    roomCam.aspect = aspect;
    let fov = ROOM_FOV;
    if (aspect >= 1 && aspect < 1.6) {
      // Narrower landscape: widen the lens to keep the whole back wall.
      const tanH = Math.tan(THREE.MathUtils.degToRad(ROOM_FOV / 2)) * 1.6;
      fov = Math.min(62, THREE.MathUtils.radToDeg(2 * Math.atan(tanH / aspect)));
    }
    seatBase.copy(SEAT);
    lookBase.copy(LOOK);
    room.setLayout(aspect < 1 ? 'portrait' : 'landscape');
    if (aspect < 1) {
      // Portrait: an over-the-shoulder view from above the chair. The desk top
      // fills the lower frame (no dead floor), the CRT the middle, both signs
      // the top. Height and distance scale with how narrow the screen is.
      fov = 66;
      const narrowness = THREE.MathUtils.clamp((1 - aspect) / 0.54, 0, 1);
      seatBase.set(0.12, THREE.MathUtils.lerp(1.45, 1.85, narrowness), THREE.MathUtils.lerp(1.0, 1.25, narrowness));
      lookBase.set(0.12, 1.1, -0.5);
    }
    roomCam.fov = fov;
    roomCam.updateProjectionMatrix();
  }

  function seatPose(dt) {
    const k = 1 - Math.exp(-dt * 3.5);
    smooth.x += (pointer.x - smooth.x) * k;
    smooth.y += (pointer.y - smooth.y) * k;
    smooth.hover += ((hovering ? 1 : 0) - smooth.hover) * (1 - Math.exp(-dt * 6));
    const reduced = prefersReducedMotion();
    const sway = reduced ? 0 : Math.sin(clock.elapsedTime * 0.6) * 0.004;
    const pos = seatBase.clone().add(new THREE.Vector3(
      reduced ? 0 : smooth.x * 0.06,
      (reduced ? 0 : smooth.y * 0.035) + sway,
      0
    ));
    const lean = room.getScreenFrame().center.clone().sub(pos).normalize().multiplyScalar(smooth.hover * 0.05);
    pos.add(lean);
    const target = lookBase.clone().add(new THREE.Vector3(reduced ? 0 : smooth.x * 0.02, reduced ? 0 : smooth.y * 0.015, 0));
    return { pos, target };
  }

  // Close enough to use the computer: the picture fills most of the frame.
  function closeupPose() {
    const frame = room.getScreenFrame();
    const t = Math.tan(THREE.MathUtils.degToRad(roomCam.fov / 2));
    const d = Math.max(frame.halfH / (t * 0.78), frame.halfW / (t * roomCam.aspect * 0.92));
    const reduced = prefersReducedMotion();
    const pos = frame.center.clone().addScaledVector(frame.normal, d)
      .add(new THREE.Vector3(reduced ? 0 : smooth.x * 0.008, reduced ? 0 : smooth.y * 0.005, 0));
    return { pos, target: frame.center.clone() };
  }

  function divePose() {
    const frame = room.getScreenFrame();
    const t = Math.tan(THREE.MathUtils.degToRad(roomCam.fov / 2));
    const d = Math.min(frame.halfH / t, frame.halfW / (t * roomCam.aspect)) * 0.9;
    return {
      pos: frame.center.clone().addScaledVector(frame.normal, d),
      target: frame.center.clone(),
      // Share of the picture's height still visible at the end of the dive.
      crop: clamp01((d * t) / frame.halfH),
    };
  }

  // ---------- transitions ----------
  let transition = null;
  let screenPower = 0; // the computer is off until the visitor clicks it
  let screenFlash = 0;
  const fadeEl = document.getElementById('stage-fade');

  function fadeTo(opacity, ms) {
    return new Promise((resolve) => {
      if (!fadeEl) return resolve();
      fadeEl.style.transitionDuration = `${ms}ms`;
      fadeEl.style.opacity = String(opacity);
      setTimeout(resolve, ms);
    });
  }

  let deskMode = 'seat'; // 'seat' | 'closeup'
  let powerTween = null;

  function announceDesk() {
    globalEventBus.emit('room-desk', { computer: desktop.state, mode: deskMode });
  }

  function powerTo(target, ms) {
    powerTween = { from: screenPower, to: target, start: performance.now(), dur: ms };
  }

  function lean(toMode) {
    if (stage.current !== 'room' || transition?.kind === 'dive') return;
    if (toMode === deskMode && !transition) return;
    transition = { kind: 'lean', start: performance.now(), toMode, fromPos: roomCam.position.clone(), fromLook: look.clone() };
    if (toMode === 'seat') {
      deskMode = 'seat';
      desktop.pointer('leave', null);
      document.body.classList.remove('is-on-screen');
    }
    announceDesk();
  }

  // Click on the computer: boot it if it is off, and lean in to use it.
  function engageComputer() {
    if (desktop.state === 'off') {
      playSfx('boot');
      desktop.boot();
      powerTo(1, 420);
    }
    lean('closeup');
  }

  // "Enter the portfolio" (button or Enter key): the fast path through the
  // same machine: instant boot, the program opens quickly, then the dive.
  function quickEnter() {
    if (stage.current !== 'room' || transition?.kind === 'dive') return;
    if (prefersReducedMotion()) {
      enterDirect();
      return;
    }
    if (desktop.state === 'off') {
      playSfx('boot');
      desktop.boot({ instant: true });
      powerTo(1, 250);
    }
    desktop.openPortfolio({ fast: true });
  }

  function startDive() {
    if (stage.current !== 'room') return;
    if (prefersReducedMotion()) {
      enterDirect();
      return;
    }
    setStage('diving');
    document.body.classList.remove('is-on-screen');
    fadeOutSfx('boot', 900);
    const end = divePose();
    transition = {
      kind: 'dive',
      start: performance.now(),
      fromPos: roomCam.position.clone(),
      fromLook: look.clone(),
      end,
    };
  }

  async function enterDirect() {
    if (stage.current !== 'room') return;
    fadeOutSfx('boot', 400);
    setStage('diving');
    await fadeTo(1, prefersReducedMotion() ? 300 : 220);
    transition = null;
    solar.playIntro();
    solar.camera.fov = SITE_FOV;
    crtPass.uniforms.uStrength.value = 0;
    setStage('site');
    await fadeTo(0, 420);
  }

  function handoffToSite(crop) {
    solar.camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(crop * Math.tan(THREE.MathUtils.degToRad(SITE_FOV / 2))));
    crtPass.uniforms.uStrength.value = 1;
    crtPass.uniforms.uFlash.value = 0.12;
    crtPass.uniforms.uOff.value = 0;
    transition = { kind: 'reveal', start: performance.now(), fovFrom: solar.camera.fov };
    setStage('site');
  }

  // The power button turns the computer off: back in the room, the CRT is dark
  // until the visitor clicks it again.
  function shutDownToRoom() {
    solar.resetView();
    desktop.powerOff();
    screenPower = 0;
    powerTween = null;
    deskMode = 'seat';
  }

  async function powerOff() {
    if (stage.current !== 'site') return;
    globalEventBus.emit('portfolio-preview', { idx: null });
    fadeOutSfx('boot', 200);
    playSfx('shutdown');
    if (prefersReducedMotion()) {
      setStage('leaving');
      await fadeTo(1, 300);
      shutDownToRoom();
      transition = null;
      setStage('room');
      announceDesk();
      await fadeTo(0, 420);
      return;
    }
    setStage('leaving');
    transition = { kind: 'collapse', start: performance.now() };
  }

  // Dev only: ?stageDebug=dive:0.6 | reveal:0.3 | collapse:0.5 | pullback:0.4 | room:8
  // freezes that transition at the given progress so a screenshot can show it.
  const debug = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('stageDebug') : null;
  let frozen = null;
  const DURATIONS = { dive: DIVE_MS, reveal: REVEAL_MS, collapse: 700, pullback: PULLBACK_MS, lean: 1100 };
  let pendingFreeze = null;
  function startDebug() {
    if (!debug) return;
    document.getElementById('intro-fade')?.remove();
    // Settle CSS transitions and camera moves instantly so captures show end states.
    document.body.classList.add('stage-debug');
    window.__stageDebugFast = true;
    const [kind, value, extra] = debug.split(':');
    const p = Number(value);
    if (kind === 'room') return;
    const bootNow = () => {
      desktop.boot({ instant: true });
      screenPower = 1;
    };
    if (kind === 'desk' || kind === 'paint' || kind === 'encyclopedia') {
      bootNow();
      deskMode = 'closeup';
      announceDesk();
      if (kind === 'paint') {
        desktop.openPaint();
        desktop.debugDoodle();
      }
      if (kind === 'encyclopedia') desktop.openEncyclopedia(p);
      return;
    }
    if (kind === 'site' || kind === 'detail') {
      setStage('site');
      solar.resetView();
      if (kind === 'detail') {
        setTimeout(() => globalEventBus.emit('portfolio-open-body', { idx: p }), 50);
        if (extra === 'launch') {
          // Freeze the external-link feedback mid-sweep for a screenshot.
          const style = document.createElement('style');
          style.textContent = '.is-launching::after{animation-delay:-45ms!important;animation-play-state:paused!important}';
          document.head.appendChild(style);
          globalEventBus.emit('external-link-opened', { host: 'github.com' });
          document.querySelector('.topbar .icon-button[href*="linkedin"]')?.classList.add('is-launching');
          const poll = () => {
            const button = document.querySelector('#panel.is-open .panel__links .button-primary');
            if (button) button.classList.add('is-launching');
            else setTimeout(poll, 30);
          };
          poll();
        }
        if (extra === 'end') {
          const stop = globalEventBus.on('portfolio-detail-opened', () => {
            stop();
            setTimeout(() => {
              const scroller = document.querySelector('.panel__scroll');
              if (scroller) scroller.scrollTop = scroller.scrollHeight;
            }, 80);
          });
        }
      }
      return;
    }
    const freezeAt = (k) => { frozen = { kind: k, el: p * DURATIONS[k] }; };
    if (kind === 'dive') {
      bootNow();
      desktop.openPortfolio({ fast: true });
      pendingFreeze = { kind: 'dive', el: p * DIVE_MS };
    }
    if (kind === 'reveal') { startDive(); handoffToSite(divePose().crop); freezeAt('reveal'); }
    if (kind === 'collapse' || kind === 'pullback') {
      setStage('site');
      powerOff();
      if (kind === 'collapse') freezeAt('collapse');
      else { transition.start -= 700; frozen = { kind: 'pullback', el: p * PULLBACK_MS }; }
    }
  }

  function tickTransition(now) {
    if (!transition) return;
    if (pendingFreeze && pendingFreeze.kind === transition.kind) {
      frozen = pendingFreeze;
      pendingFreeze = null;
    }
    const el = frozen && frozen.kind === transition.kind ? frozen.el : now - transition.start;

    if (transition.kind === 'dive') {
      const p = clamp01(el / DIVE_MS);
      const e = easeCamera(p);
      roomCam.position.lerpVectors(transition.fromPos, transition.end.pos, e);
      look.lerpVectors(transition.fromLook, transition.end.target, e);
      // Phosphor glow builds as the glass fills the view, instead of a flat white.
      const k = clamp01((p - 0.6) / 0.4);
      screenFlash = k * k * k;
      bloom.strength = BLOOM + k * k * 0.9;
      if (p >= 1) {
        screenFlash = 0;
        bloom.strength = BLOOM;
        handoffToSite(transition.end.crop);
      }
    } else if (transition.kind === 'reveal') {
      const p = clamp01(el / REVEAL_MS);
      const e = easeOut(p);
      crtPass.uniforms.uStrength.value = 1 - e;
      crtPass.uniforms.uFlash.value = 0.12 * Math.pow(1 - e, 3);
      solar.camera.fov = THREE.MathUtils.lerp(transition.fovFrom, SITE_FOV, e);
      if (p >= 1) {
        crtPass.uniforms.uStrength.value = 0;
        crtPass.uniforms.uFlash.value = 0;
        solar.camera.fov = SITE_FOV;
        transition = null;
      }
    } else if (transition.kind === 'collapse') {
      // 0-240ms: the glass returns; 240-700ms: picture collapses to a line, then a dot.
      crtPass.uniforms.uStrength.value = easeOut(clamp01(el / 240));
      crtPass.uniforms.uOff.value = clamp01((el - 240) / 460);
      if (el >= 700) {
        shutDownToRoom();
        crtPass.uniforms.uStrength.value = 0;
        crtPass.uniforms.uOff.value = 0;
        const end = divePose();
        roomCam.position.copy(end.pos);
        look.copy(end.target);
        transition = { kind: 'pullback', start: now, fromPos: end.pos.clone(), fromLook: end.target.clone() };
      }
    } else if (transition.kind === 'pullback') {
      const p = clamp01(el / PULLBACK_MS);
      const e = easeCamera(p);
      const seat = seatPose(0);
      roomCam.position.lerpVectors(transition.fromPos, seat.pos, e);
      look.lerpVectors(transition.fromLook, seat.target, e);
      if (p >= 1) {
        transition = null;
        setStage('room');
        announceDesk();
      }
    } else if (transition.kind === 'lean') {
      const p = clamp01(el / 1100);
      const e = easeCamera(p);
      const goal = transition.toMode === 'closeup' ? closeupPose() : seatPose(0);
      roomCam.position.lerpVectors(transition.fromPos, goal.pos, e);
      look.lerpVectors(transition.fromLook, goal.target, e);
      if (p >= 1) {
        deskMode = transition.toMode;
        transition = null;
        announceDesk();
        syncScreenPointer();
      }
    }
  }

  // ---------- input in the room ----------
  const ndcFor = (clientX, clientY) => new THREE.Vector2((clientX / W()) * 2 - 1, -(clientY / H()) * 2 + 1);

  // Which radio button (if any) is under the pointer.
  function hitRadio(clientX, clientY) {
    raycaster.setFromCamera(ndcFor(clientX, clientY), roomCam);
    const hit = raycaster.intersectObjects(room.radioButtons, false)[0];
    return hit?.object.userData.radioAction || null;
  }

  function pressRadio(action) {
    room.pressRadioButton(action);
    radioCommand(action);
  }

  function hitMonitor(clientX, clientY) {
    raycaster.setFromCamera(ndcFor(clientX, clientY), roomCam);
    return raycaster.intersectObjects(room.interactive, true).length > 0;
  }

  // Pointer → pixel on the computer's screen, through the same barrel curve the
  // CRT shader applies, so the drawn cursor sits exactly under the real one.
  function screenPoint(clientX, clientY) {
    raycaster.setFromCamera(ndcFor(clientX, clientY), roomCam);
    const hit = raycaster.intersectObject(room.screenMesh, false)[0];
    if (!hit?.uv) return null;
    const cx = hit.uv.x - 0.5;
    const cy = hit.uv.y - 0.5;
    const k = (1 + 0.22 * (cx * cx + cy * cy)) * 1.12;
    const u = 0.5 + cx * k;
    const v = 0.5 + cy * k;
    if (u < 0 || u > 1 || v < 0 || v > 1) return null;
    return { x: u * desktop.size.width, y: (1 - v) * desktop.size.height };
  }

  const usingComputer = () => stage.current === 'room' && deskMode === 'closeup' && !transition;

  const lastClient = { x: -1, y: -1 };
  // When the camera arrives at the screen, hand the cursor over at once.
  function syncScreenPointer() {
    if (!usingComputer() || lastClient.x < 0) return;
    const p = screenPoint(lastClient.x, lastClient.y);
    desktop.pointer('move', p);
    document.body.classList.toggle('is-on-screen', Boolean(p));
  }

  canvas.addEventListener('pointermove', (e) => {
    lastClient.x = e.clientX;
    lastClient.y = e.clientY;
    pointer.x = (e.clientX / W()) * 2 - 1;
    pointer.y = (e.clientY / H()) * 2 - 1;
    if (stage.current !== 'room') return;
    if (usingComputer()) {
      const p = screenPoint(e.clientX, e.clientY);
      desktop.pointer('move', p);
      document.body.classList.toggle('is-on-screen', Boolean(p));
      hovering = false;
      document.body.classList.remove('is-hovering');
      return;
    }
    const overRadio = e.pointerType === 'mouse' && Boolean(hitRadio(e.clientX, e.clientY));
    hovering = overRadio || (deskMode === 'seat' && !transition && e.pointerType === 'mouse' && hitMonitor(e.clientX, e.clientY));
    document.body.classList.toggle('is-hovering', hovering);
  }, { passive: true });

  canvas.addEventListener('pointerdown', (e) => {
    if (!usingComputer()) return;
    const p = screenPoint(e.clientX, e.clientY);
    const radioAction = p ? null : hitRadio(e.clientX, e.clientY);
    if (p) {
      canvas.setPointerCapture?.(e.pointerId);
      desktop.pointer('down', p);
    } else if (radioAction) {
      pressRadio(radioAction);
    } else if (!hitMonitor(e.clientX, e.clientY)) {
      // Clicking the room around the computer: sit back.
      lean('seat');
    }
  });

  const releasePointer = (e) => {
    if (!usingComputer()) return;
    desktop.pointer('up', screenPoint(e.clientX, e.clientY));
  };
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
  canvas.addEventListener('pointerleave', () => {
    if (!usingComputer()) return;
    desktop.pointer('leave', null);
    document.body.classList.remove('is-on-screen');
  });

  canvas.addEventListener('click', (e) => {
    if (stage.current !== 'room' || deskMode !== 'seat' || transition?.kind === 'dive') return;
    const radioAction = hitRadio(e.clientX, e.clientY);
    if (radioAction) {
      pressRadio(radioAction);
      return;
    }
    if (hitMonitor(e.clientX, e.clientY)) {
      hovering = false;
      document.body.classList.remove('is-hovering');
      engageComputer();
    } else {
      globalEventBus.emit('room-missed-click');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (stage.current !== 'room' || e.repeat) return;
    if (e.key === 'Escape' && deskMode === 'closeup') {
      lean('seat');
      return;
    }
    if (e.key !== 'Enter') return;
    const tag = e.target?.tagName;
    if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT') return;
    quickEnter();
  });

  globalEventBus.on('radio-command', ({ action }) => room.pressRadioButton(action));
  globalEventBus.on('stage-start', quickEnter);
  globalEventBus.on('stage-skip', enterDirect);
  globalEventBus.on('stage-power-off', powerOff);
  globalEventBus.on('language-changed', ({ language: next }) => {
    language = next;
    desktop.invalidate();
  });

  // ---------- resize ----------
  function resize() {
    renderer.setSize(W(), H());
    roomComposer.setSize(W(), H());
    siteComposer.setSize(W(), H());
    siteBloom.resolution.set(W(), H());
    bloom.resolution.set(W(), H());
    crtPass.uniforms.uLines.value = Math.round(H() / 3);
    frameRoomCamera();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- frame loop ----------
  const clock = new THREE.Clock();
  let firstFrame = true;

  function renderRoom(dt, et) {
    const d = desktop.update();
    if (d.solarVisible) {
      solar.camera.clearViewOffset();
      viewShift = 0;
      solar.camera.aspect = d.aspect;
      solar.camera.fov = SITE_FOV;
      solar.camera.updateProjectionMatrix();
      renderer.setRenderTarget(solarRT);
      renderer.render(solar.scene, solar.camera);
      renderer.setRenderTarget(null);
    }
    const u = room.screenMaterial.uniforms;
    u.uWin.value.set(d.win[0], d.win[1], d.win[2], d.win[3]);
    u.uPower.value = screenPower;
    // Using the computer up close: calmer picture and bloom, so bright
    // windows (Paint's paper) stay crisp instead of glowing.
    const close = deskMode === 'closeup' || transition?.toMode === 'closeup';
    bloom.threshold = close ? 0.97 : 0.9;
    u.uBright.value = (close ? 0.86 : 1) + smooth.hover * 0.12;
    u.uBright.value += screenFlash * 0.9;
    u.uFlash.value = screenFlash * 0.08;
    room.update(dt, et, {
      loading: d.busy,
      power: screenPower,
      screenBright: 1 + screenFlash,
      reducedMotion: prefersReducedMotion(),
      computerOn: d.powered,
      radioInfo: { ...getRadioState(), level: getLevel(), emptyText: getTranslation(language, 'radio.empty') },
    });

    const seat = seatPose(dt);
    if (stage.current === 'room' && !transition) {
      const pose = deskMode === 'closeup' ? closeupPose() : seat;
      roomCam.position.copy(pose.pos);
      look.copy(pose.target);
    }
    roomCam.lookAt(look);

    grade.uniforms.uTime.value = et;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    roomComposer.render(dt);
  }

  // On wide screens the index covers the left column: move the projection
  // centre into the free area so no body sits under it. Eased, never a jump.
  function updateViewShift(dt) {
    const gutter = Math.min(32, Math.max(16, W() * 0.022));
    const wide = W() > 820;
    const detail = document.body.classList.contains('is-detail-view');
    // Overview: centre right of the index. Detail: centre right of the panel.
    const panel = W() > 1100 ? Math.min(600, W() * 0.46) : Math.min(560, W() * 0.54);
    let target = 0;
    if (wide) target = detail ? panel / 2 : (304 + gutter) / 2;
    viewShift += (target - viewShift) * (1 - Math.exp(-dt * 4));
    if (Math.abs(viewShift) < 0.5) solar.camera.clearViewOffset();
    else solar.camera.setViewOffset(W(), H(), -viewShift, 0, W(), H());
  }

  function renderSite(dt) {
    solar.camera.aspect = W() / H();
    solar.camera.updateProjectionMatrix();
    updateViewShift(dt);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1;
    siteComposer.render(dt);
  }

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const et = clock.elapsedTime;
    const now = performance.now();

    tickTransition(now);
    if (powerTween) {
      const p = clamp01((now - powerTween.start) / powerTween.dur);
      screenPower = THREE.MathUtils.lerp(powerTween.from, powerTween.to, easeOut(p));
      if (p >= 1) powerTween = null;
    }
    solar.update(dt, et);

    const showSite = stage.current === 'site' || (transition && transition.kind === 'collapse');
    if (showSite) renderSite(dt);
    else renderRoom(dt, et);

    if (firstFrame) {
      firstFrame = false;
      document.getElementById('intro-fade')?.classList.add('hide');
      globalEventBus.emit('stage-ready');
      startDebug();
      const queued = markStageMounted();
      if (queued) globalEventBus.emit(queued);
    }
  }
  frame();
}
