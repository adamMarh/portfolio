import * as THREE from 'three';
import { PROJECTS } from '../../data/portfolio.js';
import { createSolarScene } from './sceneService.js';
import { getTranslation, getPlanetName } from '../../i18n/translations.js';
import { globalEventBus } from '../../utils/eventBus.js';
import { stage } from '../stage/state.js';

// The solar-system portfolio. It no longer owns the renderer or the frame loop:
// the stage controller renders it into the CRT in the room and full screen on
// the site, and calls update() every frame. Input only counts in the site stage.

const START_POS = new THREE.Vector3(-4, 24, 82);
const INTRO_FROM = new THREE.Vector3(-8, 34, 98);

function fireAnim(camera, camAnim, modeState, toPos, toLook, dur, cb) {
  camAnim.from.copy(camera.position);
  camAnim.to.copy(toPos);
  camAnim.lookFrom.copy(camAnim.curLook);
  camAnim.lookTo.copy(toLook);
  camAnim.start = performance.now();
  camAnim.dur = window.__stageDebugFast ? 1 : dur;
  camAnim.cb = cb;
  modeState.mode = 'animating';
}

function tickAnim(camera, camAnim, modeState) {
  if (modeState.mode !== 'animating') return;
  const raw = (performance.now() - camAnim.start) / camAnim.dur;
  const t = Math.min(raw, 1);
  const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  camera.position.lerpVectors(camAnim.from, camAnim.to, e);
  camAnim.curLook.lerpVectors(camAnim.lookFrom, camAnim.lookTo, e);
  camera.lookAt(camAnim.curLook);

  if (t >= 1 && camAnim.cb) {
    const cb = camAnim.cb;
    camAnim.cb = null;
    cb();
  }
}

function fadeMat(mat, target, dur, onDone) {
  mat.transparent = true;
  // A ghosted body must not write depth, or it cuts a dark disc out of the stars.
  mat.depthWrite = target >= 1;
  const from = mat.opacity;
  const start = performance.now();
  if (window.__stageDebugFast) dur = 1;
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    mat.opacity = from + (target - from) * e;
    if (t < 1) requestAnimationFrame(tick);
    else onDone?.();
  }
  requestAnimationFrame(tick);
}

// Bodies that step aside fade out completely and leave the scene, so no ghost
// disc can show over the sun or along the panel edge.
function fadeMesh(mesh, target, dur) {
  if (!mesh) return;
  if (target > 0) mesh.visible = true;
  fadeMat(mesh.material, target, dur, () => {
    if (target === 0) mesh.visible = false;
  });
  mesh.children.forEach((c) => {
    if (c.isMesh) fadeMat(c.material, target, dur);
  });
}

function setMeshOpacity(mesh, value) {
  if (!mesh) return;
  mesh.material.opacity = value;
  mesh.material.depthWrite = value >= 1;
  mesh.visible = value > 0;
  mesh.children.forEach((c) => {
    if (c.isMesh) c.material.opacity = value;
  });
}

export function mountPortfolioSolarSystem({ renderer, canvas }) {
  const tooltip = document.getElementById('tooltip');
  const dragHint = document.getElementById('drag-hint');
  const selectionArrow = document.getElementById('selection-arrow');

  let currentLanguage = localStorage.getItem('portfolio-language') || 'fr';

  const sceneState = createSolarScene({ renderer, projects: PROJECTS });
  const { scene, camera, sph, sunGroup, sunCore, corona, pivots, meshes, interactives, W, H } = sceneState;

  const modeState = { mode: 'solar' };
  const camAnim = {
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    lookFrom: new THREE.Vector3(),
    lookTo: new THREE.Vector3(),
    curLook: new THREE.Vector3(),
    start: 0,
    dur: 0,
    cb: null,
  };

  // Zoom bounds, expressed as camera distance to the look target.
  const ZOOM_MAX_DIST = START_POS.length();
  const ZOOM_MIN_DIST = 12;
  let lastEmittedZoom = 0;
  const distToZoomLevel = (d) =>
    Math.min(1, Math.max(0, Math.log(ZOOM_MAX_DIST / d) / Math.log(ZOOM_MAX_DIST / ZOOM_MIN_DIST)));
  const zoomLevelToDist = (level) => ZOOM_MAX_DIST * Math.pow(ZOOM_MIN_DIST / ZOOM_MAX_DIST, level);

  function syncSphFromCamera() {
    sph.r = camera.position.length();
    sph.theta = Math.atan2(camera.position.x, camera.position.z);
    sph.phi = Math.acos(camera.position.y / camera.position.length());
  }

  function emitZoomLevel() {
    const level = distToZoomLevel(camera.position.distanceTo(camAnim.curLook));
    if (Math.abs(level - lastEmittedZoom) < 0.001) return;
    lastEmittedZoom = level;
    globalEventBus.emit('zoom-changed', { level });
  }

  function setZoomLevel(level) {
    if (modeState.mode !== 'solar') return;
    const dir = camera.position.clone().sub(camAnim.curLook);
    if (dir.lengthSq() === 0) dir.set(0, 0, 1);
    dir.normalize().multiplyScalar(zoomLevelToDist(level));
    camera.position.copy(camAnim.curLook).add(dir);
    camera.lookAt(camAnim.curLook);
    syncSphFromCamera();
    lastEmittedZoom = level;
  }

  let firstInteractionSent = false;
  function noteInteraction() {
    if (firstInteractionSent) return;
    firstInteractionSent = true;
    globalEventBus.emit('portfolio-first-interaction');
  }

  let selectedIdx = -1;
  let selectedBody = null;
  let previewIdx = null;
  const raycaster = new THREE.Raycaster();
  const mouse2d = new THREE.Vector2();

  const bodyFor = (idx) => (idx === -1 ? sunCore : meshes[idx]);
  const radiusFor = (idx) => (idx === -1 ? 3.8 : PROJECTS[idx].r);

  function updateSelectionArrowPosition() {
    if (!selectionArrow) return;
    if (stage.current !== 'site' || modeState.mode !== 'solar' || previewIdx === null) {
      selectionArrow.style.opacity = '0';
      return;
    }
    const worldPos = new THREE.Vector3();
    bodyFor(previewIdx).getWorldPosition(worldPos);
    worldPos.project(camera);
    const x = (worldPos.x * 0.5 + 0.5) * W();
    const y = (-worldPos.y * 0.5 + 0.5) * H();
    selectionArrow.style.transform = `translate3d(${x}px, ${Math.max(84, y - (radiusFor(previewIdx) * 24 + 30))}px, 0) translate(-50%, -100%)`;
    selectionArrow.style.opacity = '1';
  }

  function updateDragHintPosition() {
    if (!dragHint || modeState.mode !== 'detail' || !selectedBody) return;
    const worldPos = new THREE.Vector3();
    selectedBody.getWorldPosition(worldPos);
    // Sit just below the body's on-screen disc, whatever its size.
    const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const edge = worldPos.clone().addScaledVector(camUp, -radiusFor(selectedIdx)).project(camera);
    worldPos.project(camera);
    const x = (worldPos.x * 0.5 + 0.5) * W();
    const y = (-edge.y * 0.5 + 0.5) * H();
    dragHint.style.transform = `translate3d(${x}px, ${Math.min(H() - 40, y + 22)}px, 0) translate(-50%, 0)`;
  }

  function detailFraming(idx) {
    const isSun = idx === -1;
    const baseRadius = radiusFor(idx);
    // On narrow screens the panel is a bottom sheet: centre the body and lift it.
    const narrow = W() < 900;
    const up = new THREE.Vector3(0, 1, 0);

    if (isSun) {
      const camTarget = new THREE.Vector3(0, baseRadius * 1.6, 19);
      const lookTarget = new THREE.Vector3(0, baseRadius * 0.85 + (narrow ? -baseRadius * 1.4 : 0), 0);
      return { camTarget, lookTarget };
    }

    // Look at the planet side-on to the sun: the sun sits ~60-75 degrees off axis,
    // out of frame, so the body is framed against space and lit from one side.
    const wPos = new THREE.Vector3();
    meshes[idx].getWorldPosition(wPos);
    const dir = wPos.clone().normalize();
    let tangent = new THREE.Vector3().crossVectors(up, dir).normalize();
    const forwardOf = (t) => t.clone().negate();
    const rightOf = (t) => new THREE.Vector3().crossVectors(forwardOf(t), up).normalize();
    // Keep the sun (and its glow) on the left, behind the panel side.
    if (rightOf(tangent).dot(dir) < 0) tangent = tangent.negate();

    const zDist = baseRadius * 5.6 + 2.8;
    const lift = baseRadius * 0.6;
    const camTarget = wPos.clone().addScaledVector(tangent, zDist).add(new THREE.Vector3(0, lift, 0));
    const lookTarget = wPos.clone().add(new THREE.Vector3(0, lift * 0.5, 0));
    // On desktop the stage shifts the projection centre right of the panel
    // (a view offset, not a rotation), which keeps the sun out of frame.
    if (narrow) lookTarget.y -= baseRadius * 2.2;
    return { camTarget, lookTarget };
  }

  function enterDetail(idx) {
    const body = bodyFor(idx);
    if (!body) return;
    const switching = modeState.mode === 'detail';
    if (switching && idx === selectedIdx) return;

    if (switching && selectedBody?.userData?.baseQuaternion) {
      selectedBody.quaternion.copy(selectedBody.userData.baseQuaternion);
    }

    previewIdx = null;
    tooltip.style.opacity = '0';
    document.body.classList.remove('is-hovering');
    document.body.classList.add('is-detail-view');
    globalEventBus.emit(switching ? 'portfolio-detail-switching' : 'portfolio-detail-opening', { idx });

    selectedIdx = idx;
    selectedBody = body;

    const { camTarget, lookTarget } = detailFraming(idx);
    meshes.forEach((m, i) => fadeMesh(m, i === idx ? 1 : 0, 600));
    if (dragHint) dragHint.style.opacity = '1';

    fireAnim(camera, camAnim, modeState, camTarget, lookTarget, switching ? 1100 : 1400, () => {
      modeState.mode = 'detail';
      globalEventBus.emit('portfolio-detail-opened', { idx });
    });
  }

  function exitDetail() {
    if (modeState.mode !== 'detail') return;
    globalEventBus.emit('portfolio-detail-closing');
    if (dragHint) dragHint.style.opacity = '0';
    modeState.mode = 'animating';
    meshes.forEach((m) => fadeMesh(m, 1.0, 600));

    const ret = new THREE.Vector3(
      sph.r * Math.sin(sph.phi) * Math.sin(sph.theta),
      sph.r * Math.cos(sph.phi),
      sph.r * Math.sin(sph.phi) * Math.cos(sph.theta)
    );

    fireAnim(camera, camAnim, modeState, ret, new THREE.Vector3(0, 0, 0), 1200, () => {
      if (selectedBody?.userData?.baseQuaternion) {
        selectedBody.quaternion.copy(selectedBody.userData.baseQuaternion);
      }
      modeState.mode = 'solar';
      selectedIdx = -1;
      selectedBody = null;
      document.body.classList.remove('is-detail-view');
      camera.lookAt(0, 0, 0);
      camAnim.curLook.set(0, 0, 0);
      emitZoomLevel();
      globalEventBus.emit('portfolio-detail-closed');
    });
  }

  // Instant return to the system overview (used before powering the CRT off).
  function resetView() {
    if (selectedBody?.userData?.baseQuaternion) {
      selectedBody.quaternion.copy(selectedBody.userData.baseQuaternion);
    }
    meshes.forEach((m) => setMeshOpacity(m, 1));
    selectedIdx = -1;
    selectedBody = null;
    previewIdx = null;
    camAnim.cb = null;
    modeState.mode = 'solar';
    camera.position.copy(START_POS);
    camAnim.curLook.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    syncSphFromCamera();
    document.body.classList.remove('is-detail-view', 'is-hovering');
    if (dragHint) dragHint.style.opacity = '0';
    tooltip.style.opacity = '0';
    globalEventBus.emit('portfolio-detail-closed');
    emitZoomLevel();
  }

  function playIntro() {
    resetView();
    camera.position.copy(INTRO_FROM);
    camera.lookAt(0, 0, 0);
    fireAnim(camera, camAnim, modeState, START_POS.clone(), new THREE.Vector3(0, 0, 0), 1700, () => {
      modeState.mode = 'solar';
      syncSphFromCamera();
    });
  }

  // ---------- input (site stage only) ----------
  let dragging = false;
  let detDragging = false;
  let prevMx = 0;
  let prevMy = 0;
  let dragDist = 0;

  const active = () => stage.current === 'site';

  function applySph() {
    camera.position.set(
      sph.r * Math.sin(sph.phi) * Math.sin(sph.theta),
      sph.r * Math.cos(sph.phi),
      sph.r * Math.sin(sph.phi) * Math.cos(sph.theta)
    );
    camera.lookAt(camAnim.curLook);
  }

  function normMouse(e) {
    return [(e.clientX / W()) * 2 - 1, -(e.clientY / H()) * 2 + 1];
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (!active() || modeState.mode === 'animating') return;
    prevMx = e.clientX;
    prevMy = e.clientY;
    dragDist = 0;
    if (modeState.mode === 'solar') dragging = true;
    if (modeState.mode === 'detail') {
      [mouse2d.x, mouse2d.y] = normMouse(e);
      raycaster.setFromCamera(mouse2d, camera);
      if (raycaster.intersectObject(selectedBody, true).length > 0) detDragging = true;
    }
    canvas.setPointerCapture?.(e.pointerId);
    document.body.classList.add('is-dragging');
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!active()) return;
    const dx = e.clientX - prevMx;
    const dy = e.clientY - prevMy;

    if (modeState.mode === 'solar') {
      if (dragging) {
        dragDist += Math.abs(dx) + Math.abs(dy);
        if (dragDist > 5) noteInteraction();
        sph.theta -= dx * 0.005;
        sph.phi = Math.max(0.22, Math.min(Math.PI * 0.72, sph.phi - dy * 0.005));
        applySph();
        emitZoomLevel();
        prevMx = e.clientX;
        prevMy = e.clientY;
      } else if (e.pointerType === 'mouse') {
        [mouse2d.x, mouse2d.y] = normMouse(e);
        raycaster.setFromCamera(mouse2d, camera);
        const hits = raycaster.intersectObjects(interactives);
        if (hits.length > 0) {
          document.body.classList.add('is-hovering');
          tooltip.style.opacity = '1';
          tooltip.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, calc(-100% - 14px))`;
          const { name, idx } = hits[0].object.userData;
          tooltip.textContent = idx === -1
            ? getTranslation(currentLanguage, 'profile.title')
            : getPlanetName(currentLanguage, name);
        } else {
          document.body.classList.remove('is-hovering');
          tooltip.style.opacity = '0';
        }
      }
    }

    if (modeState.mode === 'detail' && detDragging && selectedBody) {
      dragDist += Math.abs(dx) + Math.abs(dy);
      const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
      const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
      const parent = selectedBody.parent;
      if (parent) {
        parent.updateMatrixWorld(true);
        const invParent = new THREE.Matrix4().copy(parent.matrixWorld).invert();
        camRight.transformDirection(invParent);
        camUp.transformDirection(invParent);
      }
      const qY = new THREE.Quaternion().setFromAxisAngle(camUp, dx * 0.005);
      const qX = new THREE.Quaternion().setFromAxisAngle(camRight, dy * 0.005);
      selectedBody.quaternion.premultiply(qX).premultiply(qY);
      prevMx = e.clientX;
      prevMy = e.clientY;
    }
  }, { passive: true });

  const endDrag = () => {
    dragging = false;
    detDragging = false;
    document.body.classList.remove('is-dragging');
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => {
    if (!active()) return;
    endDrag();
    tooltip.style.opacity = '0';
    document.body.classList.remove('is-hovering');
  });

  canvas.addEventListener('click', (e) => {
    if (!active() || modeState.mode !== 'solar' || dragDist > 5) return;
    [mouse2d.x, mouse2d.y] = normMouse(e);
    raycaster.setFromCamera(mouse2d, camera);
    const hits = raycaster.intersectObjects(interactives);
    if (hits.length > 0) {
      noteInteraction();
      enterDetail(hits[0].object.userData.idx);
    }
  });

  // Pointer-centered zoom toward the world point under the cursor (or the y=0 plane).
  canvas.addEventListener('wheel', (e) => {
    if (!active()) return;
    e.preventDefault();
    if (modeState.mode === 'animating') return;
    noteInteraction();

    const rect = canvas.getBoundingClientRect();
    mouse2d.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(mouse2d, camera);
    const hits = raycaster.intersectObjects(interactives);
    const point = new THREE.Vector3();
    if (hits.length > 0) {
      point.copy(hits[0].point);
    } else {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      if (!raycaster.ray.intersectPlane(plane, point)) point.set(0, 0, 0);
    }

    let scale = Math.exp(e.deltaY * 0.0012);
    if (modeState.mode === 'solar') {
      const curDist = camera.position.distanceTo(camAnim.curLook);
      scale = Math.min(ZOOM_MAX_DIST / curDist, Math.max(ZOOM_MIN_DIST / curDist, scale));
      if (Math.abs(scale - 1) < 1e-4) return;
    }

    const curLook = camAnim.curLook.clone();
    const camOffset = camera.position.clone().sub(point).multiplyScalar(scale);
    const lookOffset = curLook.clone().sub(point).multiplyScalar(scale);
    camera.position.copy(point.clone().add(camOffset));
    camAnim.curLook.copy(point.clone().add(lookOffset));
    camera.lookAt(camAnim.curLook);
    syncSphFromCamera();
    if (modeState.mode === 'solar') emitZoomLevel();
  }, { passive: false });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    if (!active() || e.key !== 'Escape') return;
    exitDetail();
  });

  globalEventBus.on('language-changed', ({ language }) => {
    currentLanguage = language;
  });
  globalEventBus.on('portfolio-open-body', ({ idx }) => {
    if (!active() || modeState.mode === 'animating') return;
    noteInteraction();
    enterDetail(idx);
  });
  globalEventBus.on('portfolio-exit-detail', () => {
    if (active()) exitDetail();
  });
  globalEventBus.on('portfolio-preview', ({ idx }) => {
    previewIdx = idx;
  });
  globalEventBus.on('zoom-set', ({ level }) => {
    if (active()) setZoomLevel(level);
  });

  // ---------- per-frame ----------
  function update(dt, et) {
    sunGroup.scale.setScalar(1 + Math.sin(et * 1.4) * 0.018);
    sunCore.rotation.y += dt * 0.07;

    PROJECTS.forEach((p, i) => {
      const pivot = pivots[i];
      const mesh = meshes[i];
      const isSelected = modeState.mode !== 'solar' && i === selectedIdx;
      if (pivot && !isSelected) pivot.rotation.y += p.orbit * dt;
      if (mesh && !isSelected) mesh.rotation.y += p.spin * dt;
    });
    if (modeState.mode === 'detail' && selectedBody && !detDragging) {
      const spinRate = selectedIdx === -1 ? 0.16 : (PROJECTS[selectedIdx]?.spin ?? 0.22);
      selectedBody.rotateY(spinRate * dt);
    }

    // While a planet is open the sun sits just off frame: dim its corona so it
    // does not bleed a hard-edged band along the panel.
    const open = modeState.mode !== 'solar' && selectedBody !== null;
    const dim = !open ? 1 : (selectedIdx >= 0 ? 0 : 0.45);
    const k = window.__stageDebugFast ? 1 : 1 - Math.exp(-dt * 8);
    corona.forEach((sprite) => {
      const target = sprite.userData.baseOpacity * dim;
      sprite.material.opacity += (target - sprite.material.opacity) * k;
      sprite.visible = sprite.material.opacity > 0.005;
    });

    tickAnim(camera, camAnim, modeState);
    if (stage.current === 'site') {
      updateDragHintPosition();
      updateSelectionArrowPosition();
    } else if (selectionArrow) {
      selectionArrow.style.opacity = '0';
    }
  }

  camera.position.copy(START_POS);
  camera.lookAt(0, 0, 0);

  return {
    scene,
    camera,
    update,
    playIntro,
    resetView,
    get mode() {
      return modeState.mode;
    },
  };
}
