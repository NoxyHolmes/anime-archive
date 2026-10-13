'use strict';
/* ================= Частицы ================= */
const Particles = (() => {
  const canvas = document.getElementById('petals');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  let parts = [];
  let frame = 0, last = performance.now();
  let gustTarget = 0, gustNow = 0, nextGust = 60;
  let running = false;

  const PRESETS = {
    sakura:   { shapes:['petal'],   colors:['#ffb7c5','#ff9eb5','#ffc0cb','#ffe0ea'], density:55, fall:80,  size:100, spin:true,  twinkle:false },
    snow:     { shapes:['flake','glow'], colors:['#ffffff','#e6f3ff','#cfe4ff'],     density:70, fall:55,  size:90,  spin:true,  twinkle:true },
    rain:     { shapes:['drop'],    colors:['#a0c4ff','#7ab8ff','#55a3ff'],          density:90, fall:220, size:70,  spin:false, twinkle:false },
    autumn:   { shapes:['leaf'],    colors:['#ff8c00','#ff4500','#daa520','#8b4513'],density:50, fall:75,  size:110, spin:true,  twinkle:false },
    stars:    { shapes:['star','glow'], colors:['#ffffff','#fffacd','#e6e6fa'],      density:60, fall:25,  size:80,  spin:false, twinkle:true },
    fireflies:{ shapes:['glow'],    colors:['#ffff00','#adff2f','#00ff00'],          density:40, fall:15,  size:100, spin:false, twinkle:true },
    hearts:   { shapes:['heart'],   colors:['#ff1493','#ff69b4','#ffb6c1'],          density:45, fall:60,  size:90,  spin:true,  twinkle:false },
    bubbles:  { shapes:['glow'],    colors:['rgba(255,255,255,.5)','rgba(255,255,255,.3)'], density:50, fall:-30, size:120, spin:false, twinkle:true },
    confetti: { shapes:['petal','star'], colors:['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff'], density:70, fall:90, size:80, spin:true, twinkle:false },
    petals:   { shapes:['petal','leaf'], colors:['#ffd76e','#ff7aa2','#b18cff','#6fd6b1'], density:55, fall:70, size:100, spin:true, twinkle:false }
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function spawn() {
    const s = window.settings || {};
    const preset = PRESETS[s.pstyle] || PRESETS.sakura;
    const shape = pick(preset.shapes);
    const color = pick(preset.colors);
    const size = (s.psize || 100) / 100;
    return {
      x: Math.random() * W,
      y: -30 - Math.random() * H * 0.5,
      vx: rand(-0.3, 0.3),
      vy: rand(0.3, 1.2) * (preset.fall / 80),
      s: rand(4, 12) * size,
      r: Math.random() * Math.PI * 2,
      vr: rand(-0.02, 0.02),
      shape, color,
      a: rand(0.4, 0.9) * ((s.palpha || 88) / 100),
      tw: Math.random() * Math.PI * 2,
      twSpeed: rand(0.02, 0.06),
      spin: preset.spin,
      twinkle: preset.twinkle
    };
  }

  function ensureCount() {
    const s = window.settings || {};
    const n = Math.round((s.density || 55) * (W * H) / (1920 * 1080));
    while (parts.length < n) parts.push(spawn());
    if (parts.length > n) parts.length = n;
  }

  /* ---- формы ---- */
  function drawPetal(c, s, color, alpha) {
    c.fillStyle = color; c.globalAlpha = alpha;
    c.beginPath();
    c.moveTo(0, s);
    c.quadraticCurveTo(s * 1.05, s * 0.1, 0, -s);
    c.quadraticCurveTo(-s * 1.05, s * 0.1, 0, s);
    c.closePath(); c.fill();
    c.globalAlpha = alpha * 0.4;
    c.strokeStyle = color; c.lineWidth = Math.max(0.5, s * 0.08);
    c.beginPath(); c.moveTo(0, s * 0.75); c.lineTo(0, -s * 0.75); c.stroke();
  }
  function drawLeaf(c, s, color, alpha) {
    c.fillStyle = color; c.globalAlpha = alpha;
    c.beginPath(); c.moveTo(0, s);
    c.quadraticCurveTo(s * 1.05, s * 0.1, 0, -s);
    c.quadraticCurveTo(-s * 1.05, s * 0.1, 0, s);
    c.closePath(); c.fill();
    c.globalAlpha = alpha * 0.45; c.strokeStyle = color;
    c.lineWidth = Math.max(0.6, s * 0.09);
    c.beginPath(); c.moveTo(0, s * 0.75); c.lineTo(0, -s * 0.75); c.stroke();
  }
  function drawFlake(c, s, color, alpha) {
    c.strokeStyle = color; c.globalAlpha = alpha;
    c.lineWidth = Math.max(0.8, s * 0.1);
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      c.beginPath(); c.moveTo(0, 0);
      c.lineTo(Math.cos(a) * s, Math.sin(a) * s); c.stroke();
      const mx = Math.cos(a) * s * 0.55, my = Math.sin(a) * s * 0.55;
      c.beginPath(); c.moveTo(mx, my);
      c.lineTo(mx + Math.cos(a + 2.1) * s * 0.3, my + Math.sin(a + 2.1) * s * 0.3);
      c.moveTo(mx, my);
      c.lineTo(mx + Math.cos(a - 2.1) * s * 0.3, my + Math.sin(a - 2.1) * s * 0.3);
      c.stroke();
    }
  }
  function drawGlow(c, s, color, alpha) {
    const g = c.createRadialGradient(0, 0, 0, 0, 0, s);
    g.addColorStop(0, color); g.addColorStop(0.4, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.globalAlpha = alpha;
    c.beginPath(); c.arc(0, 0, s, 0, Math.PI * 2); c.fill();
  }
  function drawStar(c, s, color, alpha) {
    c.fillStyle = color; c.globalAlpha = alpha;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? s : s * 0.45;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath(); c.fill();
  }
  function drawDrop(c, s, color, alpha) {
    c.strokeStyle = color; c.globalAlpha = alpha;
    c.lineWidth = Math.max(0.8, s * 0.15);
    c.beginPath(); c.moveTo(0, -s); c.lineTo(0, s); c.stroke();
  }
  function drawHeart(c, s, color, alpha) {
    c.fillStyle = color; c.globalAlpha = alpha;
    c.beginPath();
    const top = s * 0.3;
    c.moveTo(0, s * 0.8 + top);
    c.bezierCurveTo(0, s * 0.5, -s, s * 0.5, -s, top);
    c.bezierCurveTo(-s, -s * 0.2, 0, -s * 0.2, 0, s * 0.3);
    c.bezierCurveTo(0, -s * 0.2, s, -s * 0.2, s, top);
    c.bezierCurveTo(s, s * 0.5, 0, s * 0.5, 0, s * 0.8 + top);
    c.closePath(); c.fill();
  }

  function step(now) {
    if (!running) return;
    const dt = Math.min(48, now - last); last = now;
    const k = dt / 16.7;
    frame++;
    const s = window.settings || {};
    const wind = (s.wind || 0) / 100;

    if (frame > nextGust) {
      gustTarget = (Math.random() < 0.5 ? -1 : 1) * rand(0.3, 1.2) * wind;
      nextGust = frame + 80 + Math.random() * 120;
    }
    gustNow += (gustTarget - gustNow) * 0.02;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.x += (p.vx + gustNow) * k;
      p.y += p.vy * k;
      if (p.spin) p.r += p.vr * k;
      if (p.twinkle) p.tw += p.twSpeed * k;

      if (p.y > H + 40 || p.x < -40 || p.x > W + 40) {
        parts[i] = spawn();
        parts[i].y = -20 - Math.random() * 40;
        continue;
      }

      let a = p.a;
      if (p.twinkle) a *= 0.6 + 0.4 * Math.abs(Math.sin(p.tw));

      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.spin) ctx.rotate(p.r);

      if (p.shape === 'petal') drawPetal(ctx, p.s, p.color, a);
      else if (p.shape === 'flake') drawFlake(ctx, p.s, p.color, a);
      else if (p.shape === 'leaf') drawLeaf(ctx, p.s, p.color, a);
      else if (p.shape === 'glow') drawGlow(ctx, p.s, p.color, a);
      else if (p.shape === 'star') drawStar(ctx, p.s, p.color, a);
      else if (p.shape === 'drop') drawDrop(ctx, p.s, p.color, a);
      else if (p.shape === 'heart') drawHeart(ctx, p.s, p.color, a);

      ctx.restore();
    }

    requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    ctx.clearRect(0, 0, W, H);
  }

  function refresh() {
    const s = window.settings || {};
    if (!s.particles) { stop(); return; }
    resize();
    ensureCount();
    start();
  }

  window.addEventListener('resize', () => { resize(); ensureCount(); });

  return { refresh, start, stop, PRESETS };
})();

/* ================= Генеративные деревья ================= */
const Trees = (() => {
  const BRANCH_STYLES = {
    sakura:  { trunk:['#3a2418','#5a3828'], crown:['#ffb7c5','#ff9eb5','#ffc0cb'], glow:'#ff7aa2', leafShape:'petal' },
    momiji:  { trunk:['#3a2418','#5a3828'], crown:['#ff6b4a','#ff4500','#ffaa00'], glow:'#ff6b4a', leafShape:'leaf' },
    oak:     { trunk:['#2a1a0e','#4a2e1a'], crown:['#3a5a2a','#4a7a3a','#5a8a4a'], glow:'#6fd6b1', leafShape:'leaf' },
    pine:    { trunk:['#3a2418','#5a3828'], crown:['#1a3a1a','#2a4a2a','#3a5a3a'], glow:'#34d399', leafShape:'needle' },
    willow:  { trunk:['#3a2418','#5a3828'], crown:['#8fb87a','#a8c890','#c0d8a0'], glow:'#6fd6b1', leafShape:'leaf' },
    birch:   { trunk:['#e8e0d0','#c8b8a0'], crown:['#8fb87a','#a8c890','#c0d8a0'], glow:'#6fd6b1', leafShape:'leaf' },
    bonsai:  { trunk:['#3a2418','#5a3828'], crown:['#4a7a3a','#5a8a4a','#6a9a5a'], glow:'#34d399', leafShape:'leaf' },
    wisteria:{ trunk:['#3a2418','#5a3828'], crown:['#b18cff','#9a6fff','#c8a8ff'], glow:'#b18cff', leafShape:'petal' },
    plum:    { trunk:['#3a2418','#5a3828'], crown:['#ff4d6d','#ff6b8a','#ff8aa8'], glow:'#ff4d6d', leafShape:'petal' },
    peach:   { trunk:['#3a2418','#5a3828'], crown:['#ffb7c5','#ffc0cb','#ffd0d8'], glow:'#ff7aa2', leafShape:'petal' },
    maple:   { trunk:['#3a2418','#5a3828'], crown:['#ff6b4a','#ff8c00','#ffaa00'], glow:'#ff6b4a', leafShape:'leaf' },
    cherry:  { trunk:['#3a2418','#5a3828'], crown:['#ffe0ea','#ffc0cb','#ffb7c5'], glow:'#ff7aa2', leafShape:'petal' },
    night:   { trunk:['#1a1020','#2a1a30'], crown:['#4a3a6a','#6a4a8a','#8a5aaa'], glow:'#b18cff', leafShape:'glow' }
  };

  function seededRand(seed) {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function buildTree(container, side, style, seed) {
    const S = BRANCH_STYLES[style] || BRANCH_STYLES.sakura;
    const rand = seededRand(seed);
    const w = container.clientWidth || 500;
    const h = container.clientHeight || 700;
    const id = 'tree-' + side + '-' + seed;

    let svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs>`;
    svg += `<radialGradient id="tg${id}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="${S.trunk[1]}"/><stop offset="1" stop-color="${S.trunk[0]}"/></radialGradient>`;
    if (S.glow) {
      svg += `<radialGradient id="gg${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${S.glow}" stop-opacity=".5"/><stop offset="1" stop-color="${S.glow}" stop-opacity="0"/></radialGradient>`;
    }
    svg += `</defs>`;

    // ствол
    const baseX = side === 'tr' ? w * 0.9 : w * 0.1;
    const baseY = h * 0.95;
    const topX = side === 'tr' ? w * 0.3 : w * 0.7;
    const topY = h * 0.15;

    svg += `<g class="sway">`;
    svg += `<path d="M ${baseX - 20},${baseY} Q ${baseX},${baseY - h * 0.3} ${(baseX + topX) / 2},${(baseY + topY) / 2} T ${topX},${topY}" stroke="url(#tg${id})" stroke-width="28" fill="none" stroke-linecap="round"/>`;

    // ветви
    const branches = 8 + Math.floor(rand() * 6);
    for (let i = 0; i < branches; i++) {
      const t = 0.2 + rand() * 0.7;
      const bx = baseX + (topX - baseX) * t + (rand() - 0.5) * 40;
      const by = baseY + (topY - baseY) * t + (rand() - 0.5) * 30;
      const ex = bx + (rand() - 0.5) * w * 0.4;
      const ey = by - rand() * h * 0.25;
      const cx = (bx + ex) / 2 + (rand() - 0.5) * 60;
      const cy = (by + ey) / 2 - rand() * 40;
      const sw = 3 + rand() * 8;
      svg += `<path d="M ${bx},${by} Q ${cx},${cy} ${ex},${ey}" stroke="url(#tg${id})" stroke-width="${sw}" fill="none" stroke-linecap="round" opacity=".85"/>`;
    }
    svg += `</g>`;

    // крона — облака листвы
    svg += `<g class="crown sway">`;
    const crowns = 14 + Math.floor(rand() * 8);
    for (let i = 0; i < crowns; i++) {
      const cx = w * 0.1 + rand() * w * 0.8;
      const cy = h * 0.05 + rand() * h * 0.55;
      const r = 30 + rand() * 70;
      const col = S.crown[Math.floor(rand() * S.crown.length)];
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity="${0.5 + rand() * 0.4}"/>`;
    }
    if (S.glow) {
      svg += `<circle cx="${w * 0.5}" cy="${h * 0.35}" r="${w * 0.35}" fill="url(#gg${id})" opacity=".6"/>`;
    }
    svg += `</g>`;
    svg += `</svg>`;

    container.innerHTML = svg;
  }

  function render() {
    const s = window.settings || {};
    const tr = document.getElementById('branch-tr');
    const bl = document.getElementById('branch-bl');
    if (!s.branches) { tr.innerHTML = ''; bl.innerHTML = ''; return; }
    const style = s.bstyle || 'sakura';
    buildTree(tr, 'tr', style, 42);
    buildTree(bl, 'bl', style, 137);
    document.documentElement.style.setProperty('--branch-alpha', ((s.balpha || 95) / 100).toFixed(2));
  }

  function applyParallax(e) {
    const s = window.settings || {};
    const p = (s.parallax || 0) / 100;
    if (!p) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    const tr = document.getElementById('branch-tr');
    const bl = document.getElementById('branch-bl');
    if (tr) tr.style.transform = `translate(${x * -20 * p}px, ${y * -15 * p}px)`;
    if (bl) bl.style.transform = `translate(${x * 15 * p}px, ${y * 10 * p}px)`;
  }

  document.addEventListener('mousemove', applyParallax);

  return { render, BRANCH_STYLES };
})();
