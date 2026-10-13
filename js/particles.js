'use strict';
/* ================================================================
   ДВИЖОК ЧАСТИЦ
   ================================================================ */
const Particles = (() => {
  const cv = document.getElementById('petals');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, parts = [], bursts = [], running = false, frame = 0, last = performance.now();
  const mouse = { x: -9e3, y: -9e3, vx: 0, vy: 0 };
  let gust = 0, gustTarget = 0, gustUntil = 0, nextGust = 140;

  const preset = () => PRESETS[settings.particleStyle] || PRESETS.sakura;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(anywhere) {
    const p = preset();
    const shape = Array.isArray(p.shape) ? pick(p.shape) : p.shape;
    const sm = settings.particleSize / 100, fm = settings.fallSpeed / 100, am = settings.particleOpacity / 100;
    return {
      shape, color: pick(p.colors),
      x: Math.random() * (W + 160) - 80,
      y: anywhere ? Math.random() * H : -20 - Math.random() * H * 0.25,
      s: rnd(p.size[0], p.size[1]) * sm,
      vy: rnd(p.vy[0], p.vy[1]) * fm,
      phase: Math.random() * Math.PI * 2,
      swaySpeed: 0.015 + Math.random() * 0.03,
      swayAmp: rnd(p.sway[0], p.sway[1]),
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.05,
      flip: Math.random() * Math.PI * 2,
      flipV: 0.02 + Math.random() * 0.05,
      alpha: rnd(p.alpha[0], p.alpha[1]) * am,
      wf: 0.5 + Math.random() * 0.9,
      twk: p.twinkle ? Math.random() * Math.PI * 2 : 0,
      glow: !!p.glow
    };
  }

  function target() {
    if (!settings.particles || REDUCED) return 0;
    return Math.round(W * H / 16000 * (0.25 + (settings.petalDensity / 100) * 1.25));
  }

  function wind() {
    const s = settings.wind / 100, t = frame;
    return (Math.sin(t * 0.004) * 0.6 + Math.sin(t * 0.0017 + 2) * 0.4 + Math.sin(t * 0.0009 + 5) * 0.3) * s * 1.5 + gust;
  }

  function petalPath(c, s) {
    c.beginPath(); c.moveTo(0, s);
    c.bezierCurveTo(s * 0.85, s * 0.45, s * 0.95, -s * 0.35, s * 0.28, -s * 0.82);
    c.quadraticCurveTo(s * 0.1, -s * 0.97, 0, -s * 0.78);
    c.quadraticCurveTo(-s * 0.1, -s * 0.97, -s * 0.28, -s * 0.82);
    c.bezierCurveTo(-s * 0.95, -s * 0.35, -s * 0.85, s * 0.45, 0, s);
    c.closePath();
  }

  function drawFlake(c, s, color, alpha) {
    c.strokeStyle = color; c.fillStyle = color; c.globalAlpha = alpha;
    if (s < 2.2) { c.beginPath(); c.arc(0, 0, s, 0, 6.283); c.fill(); return; }
    c.lineWidth = Math.max(.8, s * .22); c.lineCap = 'round'; c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      c.moveTo(0, 0); c.lineTo(Math.cos(a) * s, Math.sin(a) * s);
      const mx = Math.cos(a) * s * .55, my = Math.sin(a) * s * .55;
      c.moveTo(mx, my); c.lineTo(mx + Math.cos(a + 2.1) * s * .3, my + Math.sin(a + 2.1) * s * .3);
      c.moveTo(mx, my); c.lineTo(mx + Math.cos(a - 2.1) * s * .3, my + Math.sin(a - 2.1) * s * .3);
    }
    c.stroke();
  }

  function drawLeaf(c, s, color, alpha) {
    c.fillStyle = color; c.globalAlpha = alpha;
    c.beginPath(); c.moveTo(0, s);
    c.quadraticCurveTo(s * 1.05, s * .1, 0, -s);
    c.quadraticCurveTo(-s * 1.05, s * .1, 0, s);
    c.closePath(); c.fill();
    c.globalAlpha = alpha * .45; c.strokeStyle = color; c.lineWidth = Math.max(.6, s * .09);
    c.beginPath(); c.moveTo(0, s * .75); c.lineTo(0, -s * .75); c.stroke();
  }

  function drawGlow(c, s, color, alpha) {
    c.globalAlpha = alpha; c.fillStyle = color; c.shadowColor = color; c.shadowBlur = s * 2.6;
    c.beginPath(); c.arc(0, 0, s * .55, 0, 6.283); c.fill(); c.fill(); c.shadowBlur = 0;
  }

  function drawStar(c, s, color, alpha) {
    c.strokeStyle = color; c.globalAlpha = alpha; c.lineWidth = Math.max(.7, s * .3); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-s, 0); c.lineTo(s, 0); c.moveTo(0, -s); c.lineTo(0, s);
    c.moveTo(-s * .45, -s * .45); c.lineTo(s * .45, s * .45);
    c.moveTo(s * .45, -s * .45); c.lineTo(-s * .45, s * .45);
    c.stroke();
  }

  function drawDrop(c, s, color, alpha) {
    c.strokeStyle = color; c.globalAlpha = alpha; c.lineWidth = s * .5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -s * 1.6); c.lineTo(0, s * 1.2); c.stroke();
  }

  function draw(p, alphaMul) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    if (p.shape === 'petal' || p.shape === 'leaf')
      ctx.scale(0.35 + 0.65 * Math.abs(Math.cos(p.flip)), 1);
    const a = Math.max(0, Math.min(1, p.alpha * alphaMul * (p.twk ? .45 + .55 * Math.abs(Math.sin(p.twk)) : 1)));
    if (p.shape === 'petal') { ctx.globalAlpha = a; ctx.fillStyle = p.color; petalPath(ctx, p.s); ctx.fill(); }
    else if (p.shape === 'flake') drawFlake(ctx, p.s, p.color, a);
    else if (p.shape === 'leaf') drawLeaf(ctx, p.s, p.color, a);
    else if (p.shape === 'glow') drawGlow(ctx, p.s, p.color, a);
    else if (p.shape === 'star') drawStar(ctx, p.s, p.color, a);
    else if (p.shape === 'drop') drawDrop(ctx, p.s, p.color, a);
    ctx.restore();
  }

  function step(now) {
    const dt = Math.min(48, now - last); last = now; const k = dt / 16.7; frame++;
    if (frame > nextGust) {
      gustTarget = (Math.random() < .5 ? -1 : 1) * (0.8 + Math.random() * 1.6) * (settings.wind / 100);
      gustUntil = frame + 50 + Math.random() * 80;
      nextGust = frame + 260 + Math.random() * 420;
    }
    if (frame > gustUntil) gustTarget = 0;
    gust += (gustTarget - gust) * 0.015 * k;
    const wv = wind();
    mouse.vx *= Math.pow(0.88, k); mouse.vy *= Math.pow(0.88, k);
    ctx.clearRect(0, 0, W, H);
    const tg = target();
    if (parts.length < tg && frame % 3 === 0) parts.push(spawn(false));
    if (parts.length > tg) parts.length = Math.max(tg, parts.length - 2);
    const spinOn = settings.particleSpin;
    for (const p of parts) {
      p.phase += p.swaySpeed * k;
      if (p.twk) p.twk += 0.05 * k;
      p.flip += p.flipV * k;
      if (spinOn) p.rot += p.rotV * k + wv * 0.002 * k;
      p.x += (Math.sin(p.phase) * p.swayAmp * 0.35 + wv * p.wf) * k;
      p.y += p.vy * k * (0.75 + 0.35 * Math.abs(Math.cos(p.phase)));
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 22500) { const f = 1 - Math.sqrt(d2) / 150; p.x += mouse.vx * f * 0.2 * k; p.y += mouse.vy * f * 0.12 * k; }
      if (p.y > H + 24 || p.y < -60 || p.x < -120 || p.x > W + 120) Object.assign(p, spawn(false));
      draw(p, 1);
    }
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.vy += 0.1 * k; b.vx *= Math.pow(0.985, k);
      b.x += b.vx * k; b.y += b.vy * k;
      if (spinOn) b.rot += b.rv * k;
      b.flip += 0.12 * k; b.life -= k;
      if (b.life <= 0 || b.y > H + 30) { bursts.splice(i, 1); continue; }
      draw(b, Math.max(0, Math.min(1, b.life / b.max * 1.3)));
    }
    if (parts.length || bursts.length || target() > 0) requestAnimationFrame(step);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  }

  function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(step); }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', e => {
    mouse.vx = Math.max(-40, Math.min(40, e.clientX - mouse.x));
    mouse.vy = Math.max(-40, Math.min(40, e.clientY - mouse.y));
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });

  return {
    init() { resize(); for (let i = 0; i < target(); i++) parts.push(spawn(true)); start(); },
    refresh() { if (target() > 0 || bursts.length) start(); },
    restyle() { parts = []; start(); },
    burst(x, y, n = 18) {
      if (REDUCED) return;
      const pr = preset();
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 4.2;
        bursts.push({
          shape: Array.isArray(pr.shape) ? pr.shape[i % pr.shape.length] : pr.shape,
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.6,
          s: rnd(pr.size[0], pr.size[1]) * (settings.particleSize / 100),
          rot: Math.random() * 6.28, rv: (Math.random() - .5) * .22,
          flip: Math.random() * 6.28, life: 55 + Math.random() * 45, max: 100,
          color: pr.colors[i % pr.colors.length],
          alpha: rnd(pr.alpha[0], pr.alpha[1]) * (settings.particleOpacity / 100),
          glow: !!pr.glow, twk: 0, wf: .7
        });
      }
      start();
    }
  };
})();
