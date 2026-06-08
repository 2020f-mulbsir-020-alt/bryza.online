/**
 * Bryza Section Animations
 * Migration map, kelp forest, whale chamber canvases
 */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Migration Canvas ---- */
  function initMigration() {
    const canvas = document.getElementById('migrationCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    let w, h, dpr;
    let schools = [];
    let routes = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = container.clientWidth;
      h = container.clientHeight || 400;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initSchools();
    }

    function initSchools() {
      schools = [];
      routes = [];

      const species = [
        { color: '#5B8CFF', count: 40, speed: 0.8, size: 3, path: 'arc' },
        { color: '#19E3D5', count: 25, speed: 0.5, size: 5, path: 'wave' },
        { color: '#E8A87C', count: 15, speed: 0.3, size: 8, path: 'straight' },
        { color: '#9B7FD4', count: 30, speed: 0.6, size: 2.5, path: 'circle' }
      ];

      species.forEach((sp, si) => {
        const route = {
          points: generateRoute(sp.path, si),
          color: sp.color
        };
        routes.push(route);

        for (let i = 0; i < sp.count; i++) {
          schools.push({
            routeIndex: si,
            progress: Math.random(),
            speed: sp.speed * 0.0003,
            size: sp.size,
            offset: (Math.random() - 0.5) * 20
          });
        }
      });
    }

    function generateRoute(type, index) {
      const points = [];
      const cy = h * (0.3 + index * 0.15);
      for (let x = 0; x <= w; x += 10) {
        let y = cy;
        if (type === 'arc') y += Math.sin(x * 0.005) * 40;
        else if (type === 'wave') y += Math.sin(x * 0.008 + index) * 25;
        else if (type === 'circle') y += Math.sin(x * 0.003) * 60;
        points.push({ x, y });
      }
      return points;
    }

    function getPointOnRoute(route, progress) {
      const idx = Math.floor(progress * (route.points.length - 1));
      const next = Math.min(idx + 1, route.points.length - 1);
      const t = (progress * (route.points.length - 1)) - idx;
      const p1 = route.points[idx];
      const p2 = route.points[next];
      return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t
      };
    }

    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(canvas);

    function draw() {
      if (visible && !reducedMotion) {
        ctx.clearRect(0, 0, w, h);

        routes.forEach((route) => {
          const hex = route.color;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${r},${g},${b},0.15)`;
          ctx.lineWidth = 1;
          route.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
        });

        schools.forEach((fish) => {
          fish.progress += fish.speed;
          if (fish.progress > 1) fish.progress = 0;

          const route = routes[fish.routeIndex];
          const pt = getPointOnRoute(route, fish.progress);
          const x = pt.x + fish.offset;
          const y = pt.y + fish.offset * 0.3;

          ctx.beginPath();
          ctx.fillStyle = route.color;
          ctx.globalAlpha = 0.7;
          ctx.arc(x, y, fish.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  /* ---- Kelp Canvas ---- */
  function initKelp() {
    const canvas = document.getElementById('kelpCanvas');
    if (!canvas) return;

    const section = canvas.closest('.section-kelp');
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let fronds = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = section.clientWidth;
      h = section.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initFronds();
    }

    function initFronds() {
      fronds = [];
      const count = reducedMotion ? 6 : 14;
      for (let i = 0; i < count; i++) {
        fronds.push({
          x: (w / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 40,
          height: h * (0.4 + Math.random() * 0.4),
          width: 8 + Math.random() * 12,
          phase: Math.random() * Math.PI * 2,
          segments: 8 + Math.floor(Math.random() * 6)
        });
      }
    }

    let time = 0;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(section);

    function drawFrond(frond) {
      const segH = frond.height / frond.segments;
      let x = frond.x;
      let y = h;

      ctx.beginPath();
      ctx.moveTo(x, y);

      for (let s = 0; s < frond.segments; s++) {
        const sway = Math.sin(time * 0.001 + frond.phase + s * 0.3) * (8 + s * 2);
        x = frond.x + sway;
        y -= segH;
        ctx.lineTo(x, y);

        if (s > 2 && s % 2 === 0) {
          const leafSway = Math.sin(time * 0.0015 + s) * 15;
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + leafSway + frond.width, y - segH * 0.3, x + leafSway * 0.5, y - segH * 0.5);
          ctx.moveTo(x, y);
        }
      }

      const grad = ctx.createLinearGradient(frond.x, h, frond.x, h - frond.height);
      grad.addColorStop(0, 'rgba(13, 77, 74, 0.8)');
      grad.addColorStop(0.5, 'rgba(25, 227, 213, 0.3)');
      grad.addColorStop(1, 'rgba(13, 77, 74, 0.2)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = frond.width * 0.3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    function draw() {
      if (visible && !reducedMotion) {
        time += 16;
        ctx.clearRect(0, 0, w, h);

        const lightGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
        lightGrad.addColorStop(0, 'rgba(234, 247, 255, 0.06)');
        lightGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, w, h);

        fronds.forEach(drawFrond);
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  /* ---- Whale Canvas ---- */
  function initWhale() {
    const canvas = document.getElementById('whaleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    let w, h, dpr;
    let whales = [];
    let time = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = container.clientWidth;
      h = container.clientHeight || 500;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      whales = [
        { x: w * 0.2, y: h * 0.4, size: 80, speed: 0.15, direction: 1 },
        { x: w * 0.7, y: h * 0.55, size: 120, speed: 0.08, direction: -1 },
        { x: w * 0.5, y: h * 0.7, size: 60, speed: 0.12, direction: 1 }
      ];
    }

    function drawWhale(whale) {
      whale.x += whale.speed * whale.direction;
      if (whale.x > w + whale.size * 2) whale.x = -whale.size * 2;
      if (whale.x < -whale.size * 2) whale.x = w + whale.size * 2;

      ctx.save();
      ctx.translate(whale.x, whale.y);
      if (whale.direction < 0) ctx.scale(-1, 1);

      const bodyGrad = ctx.createLinearGradient(-whale.size, 0, whale.size, 0);
      bodyGrad.addColorStop(0, 'rgba(7, 19, 31, 0.9)');
      bodyGrad.addColorStop(0.5, 'rgba(91, 140, 255, 0.4)');
      bodyGrad.addColorStop(1, 'rgba(7, 19, 31, 0.7)');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, whale.size, whale.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-whale.size * 0.8, -whale.size * 0.1);
      ctx.quadraticCurveTo(-whale.size * 1.3, -whale.size * 0.5, -whale.size * 1.1, 0);
      ctx.quadraticCurveTo(-whale.size * 1.3, whale.size * 0.5, -whale.size * 0.8, whale.size * 0.1);
      ctx.fill();

      ctx.fillStyle = 'rgba(25, 227, 213, 0.3)';
      ctx.beginPath();
      ctx.arc(whale.size * 0.3, -whale.size * 0.1, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function spawnSongWave() {
      const wavesContainer = document.getElementById('whaleSongWaves');
      if (!wavesContainer || reducedMotion) return;

      const wave = document.createElement('div');
      wave.className = 'song-wave';
      wave.style.left = (whales[1]?.x || w * 0.5) + 'px';
      wave.style.top = (whales[1]?.y || h * 0.5) + 'px';
      wave.style.transform = 'translate(-50%, -50%)';
      wavesContainer.appendChild(wave);
      setTimeout(() => wave.remove(), 4000);
    }

    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(canvas);

    let waveTimer = 0;
    function draw() {
      if (visible && !reducedMotion) {
        time += 16;
        ctx.clearRect(0, 0, w, h);
        whales.forEach(drawWhale);

        waveTimer += 16;
        if (waveTimer > 3000) {
          spawnSongWave();
          waveTimer = 0;
        }
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  /* ---- Scroll Reveal ---- */
  function initReveal() {
    const elements = document.querySelectorAll(
      '.current-item, .coral-formation, .migration-story, .kelp-organism, ' +
      '.biolum-creature, .archive-artifact, .song-reveal, .light-node, .heart-chamber'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.add('reveal');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    elements.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMigration();
    initKelp();
    initWhale();
    initReveal();
  });
})();
