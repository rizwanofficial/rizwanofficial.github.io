/* ============================================================
   Mohamed Rizwan K — Portfolio interactions
   - Section nav + scroll spy
   - Scroll reveal, count-up stats, scroll progress
   - Preloader boot sequence
   - Light/dark theme toggle (persisted)
   - Three.js: animated skill-graph with data pulses + starfield
   - Three.js: floating wireframe accent
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  var THEME_KEY = 'rizwan-portfolio-theme';
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === 'dark' || saved === 'light') {
      root.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  })();
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  /* ---------- Preloader boot sequence ---------- */
  (function preloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var lines = Array.prototype.slice.call(pre.querySelectorAll('.preloader__line'));
    var barFill = pre.querySelector('.preloader__bar span');
    var i = 0;
    var stepMs = reduceMotion ? 40 : 260;

    function next() {
      if (i < lines.length) {
        lines[i].classList.add('on');
        if (barFill) barFill.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
        i++;
        setTimeout(next, stepMs);
      } else {
        setTimeout(done, reduceMotion ? 60 : 300);
      }
    }
    function done() { pre.classList.add('is-done'); }
    // Fallback so the site is never trapped behind the loader.
    setTimeout(done, 4000);
    next();
  })();

  /* ---------- Section nav highlighting ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  var treeItems = Array.prototype.slice.call(document.querySelectorAll('.tree-item'));
  var tabItems = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var statusSection = document.getElementById('statusSection');
  var extMap = { hero: 'Home', about: 'About', experience: 'Experience', projects: 'Projects', skills: 'Skills', certifications: 'Certifications', contact: 'Contact' };

  function setActive(id) {
    treeItems.forEach(function (el) { el.classList.toggle('is-active', el.dataset.target === id); });
    tabItems.forEach(function (el) { el.classList.toggle('is-active', el.dataset.target === id); });
    if (statusSection && extMap[id]) statusSection.textContent = extMap[id];
  }

  var contentEl = document.getElementById('content');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!best || e.intersectionRatio > best.intersectionRatio) best = e; }
      });
      if (best) setActive(best.target.id);
    }, { root: contentEl, threshold: [0.2, 0.4, 0.6] });
    sections.forEach(function (s) { io.observe(s); });
  }
  setActive('hero');

  /* ---------- Scroll progress ---------- */
  var progressFill = document.getElementById('scrollProgressFill');
  if (contentEl && progressFill) {
    var ticking = false;
    function updateProgress() {
      var max = contentEl.scrollHeight - contentEl.clientHeight;
      var pct = max > 0 ? (contentEl.scrollTop / max) * 100 : 0;
      progressFill.style.width = pct + '%';
      ticking = false;
    }
    contentEl.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateProgress); ticking = true; }
    }, { passive: true });
    updateProgress();
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    var groupDelay = {};
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var parent = entry.target.parentElement;
          var key = parent ? parent.className : 'x';
          groupDelay[key] = (groupDelay[key] || 0) + 1;
          var delay = Math.min(groupDelay[key] * 60, 300);
          setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
          revealIO.unobserve(entry.target);
        }
      });
    }, { root: contentEl, threshold: 0.12 });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Count-up stats ---------- */
  var statEls = Array.prototype.slice.call(document.querySelectorAll('.stat b[data-count]'));
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var suffix = el.dataset.suffix || '';
    var start = null;
    var dur = reduceMotion ? 1 : 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); statIO.unobserve(e.target); }
      });
    }, { root: contentEl, threshold: 0.6 });
    statEls.forEach(function (el) { statIO.observe(el); });
  } else {
    statEls.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  }

  /* ---------- Mobile sidebar ---------- */
  var sidebar = document.getElementById('sidebar');
  var menuToggle = document.getElementById('menuToggle');
  var scrim = document.getElementById('scrim');
  function closeMenu() { sidebar.classList.remove('is-open'); scrim.classList.remove('is-open'); }
  function openMenu() { sidebar.classList.add('is-open'); scrim.classList.add('is-open'); }
  if (menuToggle) { menuToggle.addEventListener('click', function () { sidebar.classList.contains('is-open') ? closeMenu() : openMenu(); }); }
  if (scrim) scrim.addEventListener('click', closeMenu);
  treeItems.forEach(function (el) { el.addEventListener('click', closeMenu); });

  /* ---------- Project card tilt ---------- */
  var tiltCard = document.getElementById('tiltCard');
  if (tiltCard && !reduceMotion) {
    tiltCard.addEventListener('mousemove', function (e) {
      var r = tiltCard.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tiltCard.style.transform = 'perspective(900px) rotateX(' + (-py * 3.5) + 'deg) rotateY(' + (px * 4.5) + 'deg) translateY(-2px)';
      tiltCard.style.boxShadow = '0 24px 44px -28px rgba(13,148,136,.35)';
    });
    tiltCard.addEventListener('mouseleave', function () {
      tiltCard.style.transform = 'none';
      tiltCard.style.boxShadow = 'none';
    });
  }

  /* ---------- Shared: soft round sprite texture ---------- */
  function makeDotTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  /* ---------- 3D hero: skill graph / embedding space ---------- */
  var canvas = document.getElementById('hero-canvas');

  if (window.THREE && canvas) {
    var heroWrap = canvas.parentElement;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 13);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    function sizeRenderer() {
      var w = heroWrap.clientWidth, h = heroWrap.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    sizeRenderer();

    var dotTex = makeDotTexture();

    /* --- Background starfield for depth --- */
    var starGroup = new THREE.Group();
    scene.add(starGroup);
    var STAR_COUNT = 340;
    var starGeo = new THREE.BufferGeometry();
    var starArr = new Float32Array(STAR_COUNT * 3);
    for (var s = 0; s < STAR_COUNT; s++) {
      var sv = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .normalize().multiplyScalar(11 + Math.random() * 12);
      starArr[s * 3] = sv.x; starArr[s * 3 + 1] = sv.y; starArr[s * 3 + 2] = sv.z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));
    var starMat = new THREE.PointsMaterial({
      size: 0.07, map: dotTex, transparent: true, color: new THREE.Color(0x3f8f83),
      opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending
    });
    starGroup.add(new THREE.Points(starGeo, starMat));

    var group = new THREE.Group();
    scene.add(group);

    var RADIUS = 5.2;
    var COUNT = 46;
    var basePositions = [];

    // Fibonacci sphere distribution.
    var offset = 2 / COUNT;
    var increment = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < COUNT; i++) {
      var y = ((i * offset) - 1) + (offset / 2);
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var phi = i * increment;
      var x = Math.cos(phi) * r;
      var z = Math.sin(phi) * r;
      basePositions.push(new THREE.Vector3(x, y, z).multiplyScalar(RADIUS));
    }

    var labels = ["Python", "PyTest", "Selenium", "Jenkins", "FastAPI", "LangChain", "FAISS", "RAG", "AWS", "Docker", "GraphQL", "Kubernetes"];
    var labeledIdx = [];
    for (var l = 0; l < labels.length; l++) { labeledIdx.push(Math.floor(l * COUNT / labels.length)); }

    // Node cloud.
    var geo = new THREE.BufferGeometry();
    var posArr = new Float32Array(COUNT * 3);
    for (var p = 0; p < COUNT; p++) {
      posArr[p * 3] = basePositions[p].x; posArr[p * 3 + 1] = basePositions[p].y; posArr[p * 3 + 2] = basePositions[p].z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    var pointsMat = new THREE.PointsMaterial({
      size: 0.34, map: dotTex, transparent: true, color: new THREE.Color(0x5eead4),
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Points(geo, pointsMat));

    // Larger "key skill" nodes.
    var keyGeo = new THREE.BufferGeometry();
    var keyArr = new Float32Array(labeledIdx.length * 3);
    labeledIdx.forEach(function (idx, k) {
      keyArr[k * 3] = basePositions[idx].x; keyArr[k * 3 + 1] = basePositions[idx].y; keyArr[k * 3 + 2] = basePositions[idx].z;
    });
    keyGeo.setAttribute('position', new THREE.BufferAttribute(keyArr, 3));
    var keyMat = new THREE.PointsMaterial({
      size: 0.62, map: dotTex, transparent: true, color: new THREE.Color(0x9beee2), depthWrite: false, blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Points(keyGeo, keyMat));

    // kNN edges.
    var K = 2;
    var edgePositions = [];
    var edgePairs = [];
    for (var a = 0; a < COUNT; a++) {
      var dists = [];
      for (var b = 0; b < COUNT; b++) { if (a === b) continue; dists.push({ idx: b, d: basePositions[a].distanceToSquared(basePositions[b]) }); }
      dists.sort(function (m, n) { return m.d - n.d; });
      for (var kk = 0; kk < K; kk++) {
        var nb = dists[kk].idx;
        edgePairs.push([a, nb]);
        edgePositions.push(basePositions[a].x, basePositions[a].y, basePositions[a].z);
        edgePositions.push(basePositions[nb].x, basePositions[nb].y, basePositions[nb].z);
      }
    }
    var edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edgePositions), 3));
    var edgeMat = new THREE.LineBasicMaterial({ color: 0x2f6b62, transparent: true, opacity: 0.4 });
    group.add(new THREE.LineSegments(edgeGeo, edgeMat));

    // Data pulses travelling along edges (the "moving" signal).
    var PULSE_COUNT = reduceMotion ? 0 : 26;
    var pulses = [];
    var pulseGeo = new THREE.BufferGeometry();
    var pulseArr = new Float32Array(Math.max(1, PULSE_COUNT) * 3);
    for (var pu = 0; pu < PULSE_COUNT; pu++) {
      pulses.push({ edge: Math.floor(Math.random() * edgePairs.length), t: Math.random(), speed: 0.004 + Math.random() * 0.008 });
    }
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulseArr, 3));
    var pulseMat = new THREE.PointsMaterial({
      size: 0.26, map: dotTex, transparent: true, color: new THREE.Color(0xffffff),
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    var pulsePoints = new THREE.Points(pulseGeo, pulseMat);
    if (PULSE_COUNT > 0) group.add(pulsePoints);

    group.rotation.x = 0.15;

    // HTML labels tracking key nodes.
    var labelLayer = document.createElement('div');
    labelLayer.style.position = 'absolute'; labelLayer.style.inset = '0';
    labelLayer.style.pointerEvents = 'none'; labelLayer.style.zIndex = '1';
    heroWrap.appendChild(labelLayer);

    var labelEls = labels.map(function (text) {
      var el = document.createElement('div');
      el.textContent = text;
      el.style.position = 'absolute';
      el.style.fontFamily = "'IBM Plex Mono', monospace";
      el.style.fontSize = '11px';
      el.style.color = 'rgba(180, 240, 230, 0.9)';
      el.style.whiteSpace = 'nowrap';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.letterSpacing = '0.02em';
      el.style.textShadow = '0 0 8px rgba(0,0,0,0.9)';
      labelLayer.appendChild(el);
      return el;
    });

    var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    heroWrap.addEventListener('mousemove', function (e) {
      var rect = heroWrap.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }, { passive: true });

    var baseRotY = 0;
    var rotSpeed = reduceMotion ? 0.00015 : 0.0018;
    var driftSpeed = reduceMotion ? 0 : 1;
    var forward = new THREE.Vector3();
    var tmpWorld = new THREE.Vector3();
    var tmpNDC = new THREE.Vector3();
    var clock = new THREE.Clock();
    var livePos = geo.attributes.position;

    // Pause the loop when the hero scrolls out of view or the tab is hidden.
    var heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
      }, { root: contentEl, threshold: 0.02 }).observe(heroWrap);
    }

    function animate() {
      requestAnimationFrame(animate);
      if (document.hidden || !heroVisible) return;
      var t = clock.getElapsedTime();

      baseRotY += rotSpeed;
      targetX += (mouseY * 0.18 - targetX) * 0.04;
      targetY += (mouseX * 0.25 - targetY) * 0.04;
      group.rotation.y = baseRotY + targetY;
      group.rotation.x = 0.15 + targetX;
      starGroup.rotation.y = baseRotY * 0.35;
      starGroup.rotation.x = 0.05;

      if (driftSpeed) {
        for (var pi = 0; pi < COUNT; pi++) {
          var bp = basePositions[pi];
          var wobble = 1 + Math.sin(t * 0.6 + pi * 1.7) * 0.02;
          livePos.array[pi * 3] = bp.x * wobble;
          livePos.array[pi * 3 + 1] = bp.y * wobble + Math.sin(t * 0.4 + pi) * 0.04;
          livePos.array[pi * 3 + 2] = bp.z * wobble;
        }
        livePos.needsUpdate = true;

        for (var qi = 0; qi < PULSE_COUNT; qi++) {
          var q = pulses[qi];
          q.t += q.speed;
          if (q.t >= 1) { q.t = 0; q.edge = Math.floor(Math.random() * edgePairs.length); }
          var pair = edgePairs[q.edge];
          var A = basePositions[pair[0]], B = basePositions[pair[1]];
          pulseArr[qi * 3] = A.x + (B.x - A.x) * q.t;
          pulseArr[qi * 3 + 1] = A.y + (B.y - A.y) * q.t;
          pulseArr[qi * 3 + 2] = A.z + (B.z - A.z) * q.t;
        }
        if (PULSE_COUNT > 0) pulseGeo.attributes.position.needsUpdate = true;
      }

      group.updateMatrixWorld();
      forward.set(0, 0, 1).transformDirection(group.matrixWorld);

      labeledIdx.forEach(function (idx, k) {
        tmpWorld.copy(basePositions[idx]).applyMatrix4(group.matrixWorld);
        var localN = basePositions[idx].clone().normalize();
        var facing = localN.dot(forward.clone().normalize());
        var opacity = Math.max(0.08, (facing + 1) / 2);
        tmpNDC.copy(tmpWorld).project(camera);
        var screenX = (tmpNDC.x * 0.5 + 0.5) * heroWrap.clientWidth;
        var screenY = (-tmpNDC.y * 0.5 + 0.5) * heroWrap.clientHeight;
        var el = labelEls[k];
        if (tmpNDC.z > 1) { el.style.opacity = 0; return; }
        el.style.left = screenX + 'px';
        el.style.top = screenY + 'px';
        el.style.opacity = String(opacity);
      });

      renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', sizeRenderer);
  }

  /* ---------- Small floating 3D accent near About ---------- */
  var aboutCanvas = document.getElementById('about-canvas');
  if (window.THREE && aboutCanvas) {
    var aScene = new THREE.Scene();
    var aCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    aCamera.position.z = 4.2;
    var aRenderer = new THREE.WebGLRenderer({ canvas: aboutCanvas, antialias: true, alpha: true });
    aRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    function sizeA() {
      var sz = aboutCanvas.clientWidth || 120;
      aRenderer.setSize(sz, sz, false);
      aCamera.aspect = 1; aCamera.updateProjectionMatrix();
    }
    sizeA();

    var geoA = new THREE.IcosahedronGeometry(1.5, 0);
    var meshA = new THREE.LineSegments(
      new THREE.EdgesGeometry(geoA),
      new THREE.LineBasicMaterial({ color: 0x0d9488, transparent: true, opacity: 0.55 })
    );
    aScene.add(meshA);

    var aSpeed = reduceMotion ? 0.0015 : 0.006;
    function animateA() {
      requestAnimationFrame(animateA);
      if (document.hidden) return;
      meshA.rotation.x += aSpeed;
      meshA.rotation.y += aSpeed * 1.4;
      aRenderer.render(aScene, aCamera);
    }
    animateA();
    window.addEventListener('resize', sizeA);
  }
})();
