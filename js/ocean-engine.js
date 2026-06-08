/**
 * Bryza Ocean Engine
 * Master canvas renderer — particles, currents, depth transitions
 */
(function () {
  'use strict';

  const canvas = document.getElementById('oceanCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let scrollProgress = 0;
  let time = 0;
  let particles = [];
  let currents = [];
  let biolumParticles = [];
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLORS = {
    abyss: '#07131F',
    biolum: '#19E3D5',
    void: '#02070D',
    current: '#5B8CFF',
    coral: '#E8A87C',
    violet: '#9B7FD4',
    seafoam: '#B8D4E3'
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const count = reducedMotion ? 40 : Math.min(180, Math.floor(width * height / 8000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: Math.random() * 0.2 + 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.5 ? 'biolum' : 'current'
      });
    }

    currents = [];
    const currentCount = reducedMotion ? 8 : 24;
    for (let i = 0; i < currentCount; i++) {
      currents.push(createCurrentLine());
    }

    biolumParticles = [];
    const bioCount = reducedMotion ? 15 : 60;
    for (let i = 0; i < bioCount; i++) {
      biolumParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01
      });
    }
  }

  function createCurrentLine() {
    const points = [];
    const startY = Math.random() * height;
    let x = -50;
    let y = startY;
    while (x < width + 50) {
      points.push({ x, y });
      x += 20 + Math.random() * 30;
      y += (Math.random() - 0.5) * 40;
    }
    return {
      points,
      offset: Math.random() * 1000,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.15 + 0.05
    };
  }

  function getDepthColors(progress) {
    const p = Math.min(1, Math.max(0, progress));
    if (p < 0.15) {
      return {
        top: lerpColor('#1a3a5c', '#07131F', p / 0.15),
        bottom: lerpColor('#0d2847', '#02070D', p / 0.15),
        light: 1 - p * 3
      };
    } else if (p < 0.5) {
      const t = (p - 0.15) / 0.35;
      return {
        top: lerpColor('#07131F', '#051018', t),
        bottom: lerpColor('#02070D', '#010508', t),
        light: Math.max(0, 0.55 - t * 0.8)
      };
    } else {
      const t = (p - 0.5) / 0.5;
      return {
        top: lerpColor('#051018', '#020508', t),
        bottom: '#010306',
        light: Math.max(0, 0.15 - t * 0.15)
      };
    }
  }

  function lerpColor(a, b, t) {
    const parse = (hex) => {
      const n = parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const ca = parse(a);
    const cb = parse(b);
    const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
    const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
    const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function drawBackground(depth) {
    const colors = getDepthColors(depth);
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, colors.top);
    grad.addColorStop(1, colors.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    if (colors.light > 0.05 && depth < 0.2) {
      const sunGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.15, 0,
        width * 0.5, height * 0.15, height * 0.6
      );
      sunGrad.addColorStop(0, `rgba(234, 247, 255, ${colors.light * 0.15})`);
      sunGrad.addColorStop(0.5, `rgba(91, 140, 255, ${colors.light * 0.05})`);
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);
    }

    if (depth < 0.12) {
      drawSurface();
    }
  }

  function drawSurface() {
    const horizonY = height * 0.35;
    const sinkOffset = scrollProgress * height * 0.3;

    ctx.save();
    ctx.translate(0, sinkOffset * 0.5);

    ctx.strokeStyle = 'rgba(234, 247, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    for (let i = 0; i < 5; i++) {
      const waveY = horizonY + 10 + i * 12;
      ctx.strokeStyle = `rgba(25, 227, 213, ${0.08 - i * 0.012})`;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const y = waveY + Math.sin(x * 0.008 + time * 0.02 + i) * (4 - i * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCurrents(depth) {
    if (depth < 0.08 || depth > 0.45) return;

    const intensity = depth < 0.25 ? (depth - 0.08) / 0.17 : 1 - (depth - 0.25) / 0.2;
    if (intensity <= 0) return;

    currents.forEach((current) => {
      const offset = Math.sin(time * 0.001 * current.speed + current.offset) * 15;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(25, 227, 213, ${current.opacity * intensity})`;
      ctx.lineWidth = 1;

      current.points.forEach((pt, i) => {
        const x = pt.x + offset;
        const y = pt.y + Math.sin(time * 0.001 + i * 0.3) * 8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  function hexToRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function drawParticles(depth) {
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y > height) p.y = 0;
      if (p.y < 0) p.y = height;

      const color = p.hue === 'biolum' ? COLORS.biolum : COLORS.current;
      const alpha = p.opacity * (0.3 + depth * 0.5);
      ctx.fillStyle = hexToRgba(color, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawBioluminescence(depth) {
    if (depth < 0.4) return;

    const intensity = Math.min(1, (depth - 0.4) / 0.35);
    biolumParticles.forEach((p) => {
      p.pulse += p.speed;
      const glow = (Math.sin(p.pulse) + 1) * 0.5;
      const alpha = glow * 0.6 * intensity;

      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      grad.addColorStop(0, `rgba(25, 227, 213, ${alpha})`);
      grad.addColorStop(0.5, `rgba(155, 127, 212, ${alpha * 0.4})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawCaustics(depth) {
    if (depth > 0.35 || depth < 0.05) return;
    const intensity = 1 - Math.abs(depth - 0.15) / 0.2;
    if (intensity <= 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const cx = width * (0.3 + i * 0.2) + Math.sin(time * 0.001 + i) * 50;
      const cy = height * 0.3 + Math.cos(time * 0.0008 + i * 2) * 30;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
      grad.addColorStop(0, `rgba(25, 227, 213, ${0.04 * intensity})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function render() {
    if (!reducedMotion) time += 16;
    drawBackground(scrollProgress);
    drawCaustics(scrollProgress);
    drawCurrents(scrollProgress);
    if (!reducedMotion) {
      drawParticles(scrollProgress);
      drawBioluminescence(scrollProgress);
    }
    requestAnimationFrame(render);
  }

  function updateScrollProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docHeight > 0 ? window.scrollY / docHeight : 0;
    document.documentElement.style.setProperty('--depth-progress', scrollProgress);
  }

  window.BryzaOcean = {
    getScrollProgress: () => scrollProgress,
    triggerWave: (x, y) => {
      if (reducedMotion) return;
      const wave = document.createElement('div');
      wave.className = 'ocean-wave';
      wave.style.left = x + 'px';
      wave.style.top = y + 'px';
      wave.style.width = '100px';
      wave.style.height = '100px';
      document.body.appendChild(wave);
      setTimeout(() => wave.remove(), 2000);
    },
    setReducedMotion: (val) => { reducedMotion = val; initParticles(); }
  };

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  resize();
  updateScrollProgress();
  render();
})();
