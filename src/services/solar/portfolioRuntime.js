import * as THREE from 'three';
import { PROJECTS, SELF_SUMMARY } from '../../data/portfolio.js';
import { createSolarScene } from './sceneService.js';
import { getTranslation, getProjectTranslation, getPlanetName } from '../../i18n/translations.js';
import { globalEventBus } from '../../utils/eventBus.js';

function fireAnim(camera, camAnim, modeState, toPos, toLook, dur, cb) {
  camAnim.from.copy(camera.position);
  camAnim.to.copy(toPos);
  camAnim.lookFrom.copy(camAnim.curLook);
  camAnim.lookTo.copy(toLook);
  camAnim.start = performance.now();
  camAnim.dur = dur;
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

function fadeMat(mat, target, dur) {
  mat.transparent = true;
  const from = mat.opacity;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    mat.opacity = from + (target - from) * e;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function fadeMesh(mesh, target, dur) {
  fadeMat(mesh.material, target, dur);
  mesh.children.forEach((c) => {
    if (c.isMesh) fadeMat(c.material, target, dur);
  });
}

function populatePanel(data, language, projectIdx = -1) {
  let panelData = data;

  // If it's a project (not the sun), get the translated version
  if (projectIdx >= 0) {
    const translatedProject = getProjectTranslation(language, projectIdx);
    if (translatedProject) {
      panelData = translatedProject;
    }
  } else {
    // For the sun/profile prefer translations for title/sub/desc/tags
    panelData = {
      title: getTranslation(language, 'profile.title'),
      sub: getTranslation(language, 'profile.sub'),
      desc: getTranslation(language, 'profile.desc'),
      tags: getTranslation(language, 'profile.tags') || (data.tags || []),
    };
  }

  const category = projectIdx === -1
    ? getTranslation(language, 'profile.category')
    : getTranslation(language, 'panel.category');

  document.getElementById('p-cat').textContent = category;
  document.getElementById('p-title').textContent = panelData.title;
  document.getElementById('p-sub').textContent = panelData.sub;
  document.getElementById('p-desc').textContent = panelData.desc;

  const el = document.getElementById('p-tags');
  el.innerHTML = '';
  (panelData.tags || []).forEach((tag) => {
    const s = document.createElement('span');
    s.className = 'tag';
    s.textContent = tag;
    el.appendChild(s);
  });
}

export function mountPortfolioSolarSystem() {
  const canvas = document.getElementById('canvas');
  const tooltip = document.getElementById('tooltip');
  const panel = document.getElementById('panel');
  const hud = document.getElementById('hud');
  const dragHint = document.getElementById('drag-hint');
  const introFade = document.getElementById('intro-fade');
  const backButton = document.getElementById('btn-back');

  let currentLanguage = localStorage.getItem('portfolio-language') || 'fr';

  const sceneState = createSolarScene({ canvas, projects: PROJECTS });
  const { renderer, scene, camera, sph, sunGroup, sunCore, pivots, meshes, interactives, W, H } = sceneState;

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

  let selectedIdx = -1;
  let selectedBody = null;
  const raycaster = new THREE.Raycaster();
  const mouse2d = new THREE.Vector2();

  function updateUILanguage(language) {
    const backButton = document.getElementById('btn-back');
    const hudText = document.getElementById('hud-text');
    const dragHint = document.getElementById('drag-hint');

    if (backButton) {
      backButton.textContent = getTranslation(language, 'nav.backToSystem');
    }
    if (hudText) {
      hudText.textContent = getTranslation(language, 'nav.dragToOrbit');
    }
    if (dragHint) {
      dragHint.textContent = getTranslation(language, 'nav.dragToRotate');
    }

    // Re-populate panel if it's open
    if (modeState.mode === 'detail' && selectedIdx !== -1) {
      const translatedProject = getProjectTranslation(language, selectedIdx);
      if (translatedProject) {
        populatePanel(translatedProject, language, selectedIdx);
      }
    } else if (modeState.mode === 'detail' && selectedIdx === -1) {
      populatePanel(SELF_SUMMARY, language, selectedIdx);
    }
  }
  let dragging = false;
  let detDragging = false;
  let prevMx = 0;
  let prevMy = 0;
  let dragDist = 0;

  function applySph() {
    camera.position.set(
      sph.r * Math.sin(sph.phi) * Math.sin(sph.theta),
      sph.r * Math.cos(sph.phi),
      sph.r * Math.sin(sph.phi) * Math.cos(sph.theta)
    );
    camera.lookAt(0, 0, 0);
    camAnim.curLook.set(0, 0, 0);
  }

  function normMouse(e) {
    return [(e.clientX / W()) * 2 - 1, -(e.clientY / H()) * 2 + 1];
  }

  function updateDragHintPosition() {
    if (!dragHint || modeState.mode !== 'detail' || !selectedBody) return;
    const worldPos = new THREE.Vector3();
    selectedBody.getWorldPosition(worldPos);
    worldPos.project(camera);
    const x = (worldPos.x * 0.5 + 0.5) * W();
    const y = (-worldPos.y * 0.5 + 0.5) * H();
    dragHint.style.left = `${x}px`;
    dragHint.style.top = `${Math.min(H() - 32, y + 88)}px`;
  }

  function enterDetail(idx) {
    tooltip.style.opacity = '0';
    document.body.classList.remove('is-hovering');
    selectedIdx = idx;

    const isSun = idx === -1;
    const payload = isSun ? SELF_SUMMARY : PROJECTS[idx];
    selectedBody = isSun ? sunCore : meshes[idx];

    const wPos = new THREE.Vector3(0, 0, 0);
    if (!isSun) meshes[idx].getWorldPosition(wPos);

    const dir = isSun ? new THREE.Vector3(0, 0, 1) : wPos.clone().normalize();
    const right = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

    const baseRadius = isSun ? 3.8 : PROJECTS[idx].r;
    const zDist = isSun ? 12.5 : (baseRadius * 5.6 + 2.8);
    const sideOff = isSun ? -6.0 : -zDist * 0.7;
    const lookSideOff = isSun ? 0 : -zDist * 0.5;
    const camTarget = wPos.clone()
      .addScaledVector(dir, zDist)
      .addScaledVector(right, sideOff)
      .add(new THREE.Vector3(0, baseRadius * 0.85, 0));
    const lookTarget = wPos.clone()
      .addScaledVector(right, -lookSideOff)
      .add(new THREE.Vector3(0, baseRadius * 0.85, 0));

    meshes.forEach((m, i) => {
      if (isSun || i !== idx) fadeMesh(m, 0.07, 700);
    });

    dragHint.style.opacity = '1';
    hud.style.opacity = '0';

    fireAnim(camera, camAnim, modeState, camTarget, lookTarget, 1400, () => {
      modeState.mode = 'detail';
      populatePanel(payload, currentLanguage, idx);
      setTimeout(() => panel.classList.add('open'), 40);
    });
  }

  function exitDetail() {
    if (modeState.mode !== 'detail') return;
    panel.classList.remove('open');
    dragHint.style.opacity = '0';
    modeState.mode = 'animating';

    meshes.forEach((m) => fadeMesh(m, 1.0, 600));

    const ret = new THREE.Vector3(
      sph.r * Math.sin(sph.phi) * Math.sin(sph.theta),
      sph.r * Math.cos(sph.phi),
      sph.r * Math.sin(sph.phi) * Math.cos(sph.theta)
    );

    fireAnim(camera, camAnim, modeState, ret, new THREE.Vector3(0, 0, 0), 1200, () => {
      if (selectedIdx >= 0 && selectedBody && selectedBody.userData && selectedBody.userData.baseQuaternion) {
        selectedBody.quaternion.copy(selectedBody.userData.baseQuaternion);
      }
      modeState.mode = 'solar';
      selectedIdx = -1;
      selectedBody = null;
      camera.lookAt(0, 0, 0);
      camAnim.curLook.set(0, 0, 0);
    });
  }

  canvas.addEventListener('mousedown', (e) => {
    if (modeState.mode === 'animating') return;
    prevMx = e.clientX;
    prevMy = e.clientY;
    dragDist = 0;
    if (modeState.mode === 'solar') dragging = true;
    if (modeState.mode === 'detail') {
      [mouse2d.x, mouse2d.y] = normMouse(e);
      raycaster.setFromCamera(mouse2d, camera);
      const hits = raycaster.intersectObject(selectedBody, true);
      if (hits.length > 0) {
        detDragging = true;
      }
    }
    document.body.classList.add('is-dragging');
  });

  canvas.addEventListener('mousemove', (e) => {
    const dx = e.clientX - prevMx;
    const dy = e.clientY - prevMy;

    if (modeState.mode === 'solar') {
      if (dragging) {
        dragDist += Math.abs(dx) + Math.abs(dy);
        sph.theta -= dx * 0.005;
        sph.phi = Math.max(0.22, Math.min(Math.PI * 0.72, sph.phi - dy * 0.005));
        applySph();
        prevMx = e.clientX;
        prevMy = e.clientY;
      } else {
        [mouse2d.x, mouse2d.y] = normMouse(e);
        raycaster.setFromCamera(mouse2d, camera);
        const hits = raycaster.intersectObjects(interactives);
        if (hits.length > 0) {
          document.body.classList.add('is-hovering');
          tooltip.style.opacity = '1';
          tooltip.style.left = `${e.clientX}px`;
          tooltip.style.top = `${e.clientY}px`;
          const name = hits[0].object.userData.name;
          const idx = hits[0].object.userData.idx;
          const displayName = idx === -1 
            ? getTranslation(currentLanguage, 'profile.title')
            : getPlanetName(currentLanguage, name);
          tooltip.textContent = displayName;
        } else {
          document.body.classList.remove('is-hovering');
          tooltip.style.opacity = '0';
        }
      }
    }

    if (modeState.mode === 'detail') {
      if (detDragging && selectedBody) {
        dragDist += Math.abs(dx) + Math.abs(dy);
        
        // Rotation around Camera Up/Right vectors mapped to world space
        const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
        const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
        
        const qY = new THREE.Quaternion().setFromAxisAngle(camUp, dx * 0.005);
        const qX = new THREE.Quaternion().setFromAxisAngle(camRight, dy * 0.005);
        
        selectedBody.quaternion.premultiply(qX).premultiply(qY);
        
        prevMx = e.clientX;
        prevMy = e.clientY;
      }
    }
  });

  canvas.addEventListener('mouseup', () => {
    dragging = false;
    detDragging = false;
    document.body.classList.remove('is-dragging');
  });

  canvas.addEventListener('mouseleave', () => {
    dragging = false;
    detDragging = false;
    tooltip.style.opacity = '0';
    document.body.classList.remove('is-dragging', 'is-hovering');
  });

  canvas.addEventListener('click', (e) => {
    if (modeState.mode !== 'solar' || dragDist > 5) return;
    [mouse2d.x, mouse2d.y] = normMouse(e);
    raycaster.setFromCamera(mouse2d, camera);
    const hits = raycaster.intersectObjects(interactives);
    if (hits.length > 0) enterDetail(hits[0].object.userData.idx);
  });

  canvas.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  backButton.addEventListener('click', exitDetail);

  globalEventBus.on('language-changed', (data) => {
    currentLanguage = data.language;
    updateUILanguage(currentLanguage);
  });

  updateUILanguage(currentLanguage);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const et = clock.getElapsedTime();

    sunGroup.scale.setScalar(1 + Math.sin(et * 1.4) * 0.018);
    sunCore.rotation.y += dt * 0.07;

    if (modeState.mode !== 'detail') {
      PROJECTS.forEach((p, i) => {
        pivots[i].rotation.y += p.orbit * dt;
        meshes[i].rotation.y += p.spin * dt;
      });
    } else {
      PROJECTS.forEach((p, i) => {
        if (i !== selectedIdx) pivots[i].rotation.y += p.orbit * dt;
      });
      if (selectedBody && !detDragging) {
        const spinRate = selectedIdx === -1 ? 0.16 : (PROJECTS[selectedIdx] ? PROJECTS[selectedIdx].spin : 0.22);
        selectedBody.rotateY(spinRate * dt);
      }
    }

    tickAnim(camera, camAnim, modeState);
    updateDragHintPosition();
    renderer.render(scene, camera);
  }
  animate();

  function playIntroSequence() {
    const introFrom = new THREE.Vector3(-8, 34, 98);
    const introTo = new THREE.Vector3(-4, 24, 82);
    camera.position.copy(introFrom);
    camera.lookAt(0, 0, 0);
    camAnim.curLook.set(0, 0, 0);

    fireAnim(camera, camAnim, modeState, introTo, new THREE.Vector3(0, 0, 0), 1700, () => {
      modeState.mode = 'solar';
      sph.theta = Math.atan2(camera.position.x, camera.position.z);
      sph.phi = Math.acos(camera.position.y / camera.position.length());
      sph.r = camera.position.length();
    });

    if (introFade) {
      requestAnimationFrame(() => introFade.classList.add('hide'));
      setTimeout(() => introFade.remove(), 1800);
    }
  }
  playIntroSequence();

  window.addEventListener('resize', () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });
}
