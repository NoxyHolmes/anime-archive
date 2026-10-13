'use strict';

/* ================= Константы ================= */
const TIERS = ['SSS','S','A','B','C','D','E'];
const TIER_COLOR = { SSS:'#ffd76e', S:'#ff4d6d', A:'#a78bfa', B:'#38bdf8', C:'#34d399', D:'#fb923c', E:'#94a3b8' };
const TIER_EPITHET = { SSS:'Шедевры', S:'Элита', A:'Отличные', B:'Хорошие', C:'Средние', D:'Слабые', E:'Провал' };
const TIER_SCORE = { SSS:7, S:6, A:5, B:4, C:3, D:2, E:1 };
const TYPES = [
  { id:'tv', label:'Сериал' },
  { id:'film', label:'Фильм' },
  { id:'ova', label:'OVA' },
  { id:'ona', label:'ONA' }
];
const TYPE_SHORT = { tv:'TV', film:'ФИЛЬМ', ova:'OVA', ona:'ONA' };
const KIND = {
  season:  { label:'Сезон',  badge:'S',  color:'#ff7aa2' },
  film:    { label:'Фильм',  badge:'Ф',  color:'#ffd76e' },
  special: { label:'Спешл',  badge:'СП', color:'#b18cff' },
  ova:     { label:'OVA',    badge:'OV', color:'#9ddba8' },
  ona:     { label:'ONA',    badge:'ON', color:'#8fb8d6' }
};
const GENRES = ['Альтернативная история','Альтернативная реальность','Ангелы','Андроиды','Антивойна','Антиутопия','Баскетбол','Безумие','Бисёнэн','Боевые искусства','Божества','Вампиры','Ведьмы','Вестерн','Виртуальная реальность','Военная тематика','Война','Воры','Гарем','Гарем (для девочек)','Гендерная интрига','Демоны','Детектив','Дзёсэй','Драконы','Драма','Зомби','Игры','Инопланетные расы','Искусственный интеллект','Искусство','Исэкай','Исторический','Киберпанк','Киборги','Китайское 3D','Комедия','Космос','Кулинария','Лоликон','Любовный треугольник','Магия','Манга','Мафия/Якудза','Махо-сёдзё','Машины','Медицина','Меха','Мистика','Мотоциклы','Музыка','Не японское','Нелинейный сюжет','Ниндзя','Охотники за головами','Параллельный мир','Пародия','Перестрелки','Пилотируемые роботы','Пираты','Повседневность','Политика','Полицейские','Полулюди','Постапокалиптика','Преступный мир','Призраки','Приключения','Прокси бои','Психология','Путешествия во времени','Романтика','Русалки','Русские в аниме','Самураи','Сверхъестественное','Силовые костюмы','Современное фэнтези','Спорт','Сражения на мечах','Стимпанк','Суккубы','Суперспособности','Сэйнэн','Сёдзё','Сёдзё-ай','Сёнэн','Сёнэн-ай','Тайный заговор','Темное фэнтези','Темные эльфы','Террористы','Трансформеры','Триллер','Убийцы','Ужасы','Фантастика','Феи','Фэнтези','Хулиганы','Целый фэнтези мир','Школьная жизнь','Экшен','Эльфы','Эротика','Этти'];
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MON_S = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const ACCENTS = { sakura:'#ff7aa2', flame:'#ff6b4a', violet:'#b18cff', mint:'#6fd6b1' };
const DATA_PATH = 'data.json';
const LS_KEY = 'animeArchive_v3';
const LS_SETTINGS = 'animeArchive_settings_v3';
const LS_SYNC = 'animeArchive_sync_v3';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= Утилиты ================= */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
function plural(n, a, b, c) {
  n = Math.abs(n) % 100; const n1 = n % 10;
  if (n > 10 && n < 20) return c;
  if (n1 > 1 && n1 < 5) return b;
  if (n1 === 1) return a;
  return c;
}
function fmtDate(d) {
  if (!d) return '—';
  if (d.d && d.m && d.y) return `${String(d.d).padStart(2,'0')}.${String(d.m).padStart(2,'0')}.${d.y}`;
  if (d.m && d.y) return `${MON_S[d.m-1]} ${d.y}`;
  if (d.y) return String(d.y);
  return '—';
}
function fmtDur(min) {
  if (!min) return '0 мин';
  const h = Math.floor(min / 60), m = min % 60;
  if (!h) return m + ' мин';
  if (!m) return h + ' ' + plural(h,'час','часа','часов');
  return h + ' ч ' + m + ' мин';
}
function normDate(d) {
  if (!d) return null;
  if (typeof d === 'object' && d.y) return d;
  const s = String(d).trim();
  let m;
  if (m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)) return { d:+m[1], m:+m[2], y:+m[3] };
  if (m = s.match(/^(\d{1,2})\.(\d{4})$/)) return { m:+m[1], y:+m[2] };
  if (m = s.match(/^(\d{4})$/)) return { y:+m[1] };
  return null;
}
function dateKey(d) {
  if (!d || !d.y) return null;
  if (!d.m) return `y-${d.y}`;
  if (!d.d) return `ym-${d.y}-${d.m}`;
  return `${d.y}-${d.m}-${d.d}`;
}
function dateSortKey(d) {
  if (!d) return 0;
  return (d.y || 0) * 10000 + (d.m || 1) * 100 + (d.d || 1);
}
function coverSrc(t) {
  if (!t.cover) return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 3"><rect width="2" height="3" fill="%23181224"/></svg>';
  return t.cover;
}

/* ================= Состояние ================= */
let state = loadTitles();
let settings = loadSettings();
let sync = loadSync();
let sortMode = 'added';
let filterTier = 'all';
let filterType = 'all';
let filterGenres = new Set();
let searchQuery = '';
let calMode = 'grid';
let calDate = new Date();
let editingId = null;
let formCoverData = null;
let popIdx = -1;

function loadTitles() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && d.titles) return d; }
  } catch(e) {}
  return { v:3, updatedAt: Date.now(), titles: [] };
}
function loadSettings() {
  const def = {
    anim:true, tempo:'normal', catView:'posters',
    embanim:'full', embanimspd:6, tierGlow:true,
    particles:true, pstyle:'sakura', petsFront:false,
    density:55, fall:80, psize:100, palpha:88, pspin:true, twinkle:false, wind:40,
    branches:true, bstyle:'sakura', sway:true, parallax:40, balpha:95,
    ambient:true, moon:true, bgdim:55,
    rowAnim:true, cascade:true, tierBg:true, modalPop:true, toastAnim:true, pillGlow:true,
    tilt:true, tiltpow:8, cardLift:true, glow:true, shine:true,
    counters:true, cntspd:900, recent:true,
    light:false, accent:'sakura', panelop:72, radius:11,
    epMin:24, filmMin:110
  };
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (raw) return { ...def, ...JSON.parse(raw) };
  } catch(e) {}
  return def;
}
function loadSync() {
  try {
    const raw = localStorage.getItem(LS_SYNC);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}
function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ v:3, updatedAt: state.updatedAt, titles: state.titles }));
  } catch(e) {
    try {
      const light = state.titles.map(t => (t.cover && t.cover.startsWith('data:')) ? { ...t, cover:'' } : t);
      localStorage.setItem(LS_KEY, JSON.stringify({ v:3, updatedAt:0, titles: light }));
    } catch(e2) { toast('Хранилище переполнено', 'warn'); }
  }
}
function persistSettings() {
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
}
function persistSync() {
  if (sync) localStorage.setItem(LS_SYNC, JSON.stringify(sync));
  else localStorage.removeItem(LS_SYNC);
}

/* ================= Расчёты ================= */
function titleEpisodes(t) {
  const u = t.units || [];
  return u.reduce((a, x) => a + (x.kind === 'season' || x.kind === 'ova' || x.kind === 'ona' || x.kind === 'special' ? (x.episodes || 0) : 0), 0);
}
function titleFilms(t) {
  return (t.units || []).filter(x => x.kind === 'film').length;
}
function titleMinutes(t) {
  const u = t.units || [];
  let min = 0;
  for (const x of u) {
    if (x.kind === 'film') min += (x.minutes || settings.filmMin);
    else min += (x.episodes || 0) * (x.minutes || settings.epMin);
  }
  return min;
}
function totals() {
  let eps = 0, films = 0, sMin = 0, fMin = 0;
  for (const t of state.titles) {
    eps += titleEpisodes(t);
    films += titleFilms(t);
    for (const x of (t.units || [])) {
      if (x.kind === 'film') fMin += (x.minutes || settings.filmMin);
      else sMin += (x.episodes || 0) * (x.minutes || settings.epMin);
    }
  }
  return { eps, films, min: sMin + fMin, sMin, fMin, n: state.titles.length };
}

/* ================= Тосты ================= */
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = 'toast ' + (type === 'warn' ? 'warn' : '');
  const ic = type === 'warn' ? 'fa-triangle-exclamation' : (type === 'ok' ? 'fa-check' : 'fa-circle-info');
  el.innerHTML = `<i class="fa-solid ${ic} ic"></i><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; setTimeout(() => el.remove(), 400); }, 3600);
}

/* ================= Применение настроек ================= */
function applySettings() {
  const b = document.body;
  const s = settings;
  const sp = { calm:1.6, normal:1, lively:0.65, instant:0.1 }[s.tempo] || 1;
  document.documentElement.style.setProperty('--sp', sp);
  document.documentElement.style.setProperty('--pa', s.panelop + '%');
  document.documentElement.style.setProperty('--rad', s.radius + 'px');
  document.documentElement.style.setProperty('--tes', s.embanimspd + 's');
  document.documentElement.style.setProperty('--accent', ACCENTS[s.accent] || ACCENTS.sakura);
  document.documentElement.style.setProperty('--bg-dim', (s.bgdim / 100).toFixed(2));
  b.classList.toggle('light', !!s.light);
  b.classList.toggle('no-anim', !s.anim || REDUCED);
  b.classList.toggle('pets-front', !!s.petsFront);
  b.classList.toggle('tilt-off', !s.tilt);
  b.classList.toggle('no-lift', !s.cardLift);
  b.classList.toggle('glow', !!s.glow);
  b.classList.toggle('shine', !!s.shine);
  b.classList.toggle('ambient', !!s.ambient);
  b.classList.toggle('no-moon', !s.moon);
  b.classList.toggle('no-sway', !s.sway);
  b.classList.toggle('no-branches', !s.branches);
  b.classList.toggle('no-rowanim', !s.rowAnim);
  b.classList.toggle('no-cascade', !s.cascade);
  b.classList.toggle('no-tierbg', !s.tierBg);
  b.classList.toggle('tier-glow', !!s.tierGlow);
  b.classList.toggle('no-modalpop', !s.modalPop);
  b.classList.toggle('no-toastanim', !s.toastAnim);
  b.classList.toggle('pill-glow', !!s.pillGlow);
  b.setAttribute('data-embanim', s.embanim);
  Trees.render();
  Particles.refresh();
}

/* ================= Рендер: шапка и навигация ================= */
function renderNav() {
  const pill = $('#nav-pill');
  const active = $('.nav-btn.active');
  if (!pill || !active) return;
  const r = active.getBoundingClientRect();
  const pr = active.parentElement.getBoundingClientRect();
  pill.style.left = (r.left - pr.left) + 'px';
  pill.style.top = (r.top - pr.top) + 'px';
  pill.style.width = r.width + 'px';
  pill.style.height = r.height + 'px';
}
function switchView(view) {
  if (view === 'settings') {
    document.body.classList.add('drawer-open');
    return;
  }
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== 'view-' + view));
  renderNav();
  window.scrollTo({ top: 0, behavior: settings.anim ? 'smooth' : 'auto' });
  if (view === 'timeline') renderTimeline();
  if (view === 'calendar') renderCalendar();
  if (view === 'stats') renderStats();
}

/* ================= Рендер: герой и статистика сверху ================= */
function renderHero() {
  const t = totals();
  $('#hero-stats').innerHTML = `
    <div class="hst"><b data-num="${t.n}">0</b><span>тайтлов</span></div>
    <div class="hst"><b data-num="${t.eps}">0</b><span>серий</span><em>${t.films} фил.</em></div>
    <div class="hst"><b data-num="${Math.round(t.min/60)}">0</b><span>часов</span><em>${fmtDur(t.min)}</em></div>
  `;
  if (settings.counters) $$('#hero-stats .sb-v, #hero-stats b[data-num]').forEach(el => animNum(el, +el.dataset.num));
}
function animNum(el, target) {
  if (!settings.counters) { el.textContent = target; return; }
  const dur = settings.cntspd;
  const start = performance.now();
  const from = 0;
  function tick(now) {
    const k = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(from + (target - from) * e);
    if (k < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ================= Рендер: сводка тиров ================= */
function renderTierTotal() {
  const by = {};
  TIERS.forEach(t => by[t] = 0);
  state.titles.forEach(t => by[t.tier] = (by[t.tier] || 0) + 1);
  const total = state.titles.length;
  let html = `<div class="tt-item all" data-tier="all" style="--tc:var(--accent)"><span class="tt-b">ALL</span><span class="tt-n">${total}</span><span class="tt-e">всего</span></div>`;
  TIERS.forEach(t => {
    html += `<div class="tt-item" data-tier="${t}" style="--tc:${TIER_COLOR[t]}"><span class="tt-b">${t}</span><span class="tt-n">${by[t]}</span><span class="tt-e">${TIER_EPITHET[t].toLowerCase()}</span></div>`;
  });
  $('#tier-total').innerHTML = html;
  $$('.tt-item').forEach(el => el.onclick = () => {
    filterTier = el.dataset.tier;
    renderFilters();
    renderTierlist();
  });
}

/* ================= Рендер: лента недавних ================= */
function renderRecent() {
  const wrap = $('#recent-wrap');
  if (!settings.recent) { wrap.innerHTML = ''; return; }
  const recent = [...state.titles].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 10);
  if (!recent.length) { wrap.innerHTML = ''; return; }
  let html = `<div class="recent"><div class="recent-head"><h2>Недавно добавлено</h2><span>${recent.length} из ${state.titles.length}</span></div><div class="recent-strip">`;
  recent.forEach((t, i) => {
    html += `<div class="card mini js-open" data-id="${t.id}" style="--ci:${i};--tc:${TIER_COLOR[t.tier]}">
      <div class="cover"><img src="${esc(coverSrc(t))}" alt="" loading="lazy" data-fb="${t.id}"><span class="type-tag">${TYPE_SHORT[t.type]||'TV'}</span><span class="tier-badge">${t.tier}</span></div>
      <div class="card-title">${esc(t.name)}</div>
    </div>`;
  });
  html += `</div></div>`;
  wrap.innerHTML = html;
  attachTilt(wrap);
}

/* ================= Рендер: фильтры ================= */
function renderFilters() {
  const genreCounts = {};
  state.titles.forEach(t => (t.genres || []).forEach(g => genreCounts[g] = (genreCounts[g] || 0) + 1));
  const activeGenres = [...filterGenres].map(g => `<span class="chip on" data-g="${esc(g)}">${esc(g)} <i>×</i></span>`).join('');
  $('#filters-wrap').innerHTML = `
    <div class="filters">
      <div class="searchbox">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></svg>
        <input id="f-search" placeholder="Поиск по названию, жанру, заметке…" value="${esc(searchQuery)}">
        <button class="sb-clear ${searchQuery?'':'hidden'}" id="sb-clear"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <select class="sort-sel" id="sort-sel">
        <option value="added"${sortMode==='added'?' selected':''}>сначала новые</option>
        <option value="added-asc"${sortMode==='added-asc'?' selected':''}>сначала старые</option>
        <option value="name"${sortMode==='name'?' selected':''}>по названию</option>
        <option value="tier"${sortMode==='tier'?' selected':''}>по тиру</option>
        <option value="time"${sortMode==='time'?' selected':''}>по времени</option>
      </select>
      <button class="btn genre-toggle ${filterGenres.size?'on':''}" id="genre-toggle">Жанры <b>${filterGenres.size||''}</b></button>
      <div class="active-genres">${activeGenres}</div>
      <div class="filter-info" id="filter-info"></div>
    </div>
    <div class="genre-panel hidden" id="genre-panel">
      <div class="gp-top">
        <div class="gp-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></svg>
          <input id="gp-search" placeholder="Найти жанр…">
        </div>
        <div class="gp-tabs">
          <button class="on" data-gt="all">все</button>
          <button data-gt="active">активные</button>
          <button data-gt="popular">популярные</button>
        </div>
      </div>
      <div class="gp-grid" id="gp-grid"></div>
    </div>
  `;
  renderGenrePanel('all');
  bindFilters();
}
function renderGenrePanel(tab) {
  const grid = $('#gp-grid');
  const q = ($('#gp-search')?.value || '').toLowerCase();
  let list = [...GENRES];
  if (tab === 'active') list = list.filter(g => filterGenres.has(g));
  if (tab === 'popular') {
    const counts = {};
    state.titles.forEach(t => (t.genres || []).forEach(g => counts[g] = (counts[g] || 0) + 1));
    list = list.filter(g => counts[g]).sort((a, b) => (counts[b]||0) - (counts[a]||0));
  }
  if (q) list = list.filter(g => g.toLowerCase().includes(q));
  if (!list.length) { grid.innerHTML = '<div class="gp-empty">Ничего не найдено</div>'; return; }
  const counts = {};
  state.titles.forEach(t => (t.genres || []).forEach(g => counts[g] = (counts[g] || 0) + 1));
  grid.innerHTML = list.map(g => {
    const on = filterGenres.has(g) ? 'on' : '';
    const c = counts[g] || 0;
    return `<span class="chip ${on}" data-g="${esc(g)}">${esc(g)}${c?` <i>${c}</i>`:''}</span>`;
  }).join('');
  $$('#gp-grid .chip').forEach(el => el.onclick = () => {
    const g = el.dataset.g;
    if (filterGenres.has(g)) filterGenres.delete(g); else filterGenres.add(g);
    renderFilters();
    renderTierlist();
  });
}
function bindFilters() {
  $('#f-search').oninput = e => {
    searchQuery = e.target.value.trim();
    $('#sb-clear').classList.toggle('hidden', !searchQuery);
    renderTierlist();
  };
  $('#sb-clear').onclick = () => {
    searchQuery = ''; $('#f-search').value = '';
    $('#sb-clear').classList.add('hidden');
    renderTierlist();
  };
  $('#sort-sel').onchange = e => { sortMode = e.target.value; renderTierlist(); };
  $('#genre-toggle').onclick = () => $('#genre-panel').classList.toggle('hidden');
  $$('.gp-tabs button').forEach(b => b.onclick = () => {
    $$('.gp-tabs button').forEach(x => x.classList.toggle('on', x === b));
    renderGenrePanel(b.dataset.gt);
  });
  $('#gp-search').oninput = () => {
    const active = $('.gp-tabs button.on');
    renderGenrePanel(active ? active.dataset.gt : 'all');
  };
  $$('.active-genres .chip').forEach(el => el.onclick = () => {
    filterGenres.delete(el.dataset.g);
    renderFilters(); renderTierlist();
  });
}

/* ================= Рендер: тир-лист ================= */
function getFilteredList() {
  let list = state.titles.slice();
  if (filterTier !== 'all') list = list.filter(t => t.tier === filterTier);
  if (filterType !== 'all') list = list.filter(t => t.type === filterType);
  if (filterGenres.size) list = list.filter(t => (t.genres || []).some(g => filterGenres.has(g)));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.notes || '').toLowerCase().includes(q) ||
      (t.genres || []).some(g => g.toLowerCase().includes(q))
    );
  }
  switch (sortMode) {
    case 'added': list.sort((a,b) => (b.createdAt||0) - (a.createdAt||0)); break;
    case 'added-asc': list.sort((a,b) => (a.createdAt||0) - (b.createdAt||0)); break;
    case 'name': list.sort((a,b) => a.name.localeCompare(b.name, 'ru')); break;
    case 'tier': list.sort((a,b) => TIER_SCORE[b.tier] - TIER_SCORE[a.tier]); break;
    case 'time': list.sort((a,b) => titleMinutes(b) - titleMinutes(a)); break;
  }
  return list;
}
function renderTierlist() {
  const list = getFilteredList();
  const info = $('#filter-info');
  if (info) info.textContent = `${list.length} из ${state.titles.length}`;
  if (!state.titles.length) {
    $('#tierlist').innerHTML = '';
    $('#empty-state').style.display = '';
    return;
  }
  $('#empty-state').style.display = 'none';
  const byTier = {};
  TIERS.forEach(t => byTier[t] = []);
  list.forEach(t => byTier[t.tier] && byTier[t.tier].push(t));
  const view = settings.catView;
  let html = '';
  TIERS.forEach((tier, i) => {
    const items = byTier[tier];
    if (!items.length && filterTier !== 'all' && filterTier !== tier) return;
    html += `<div class="tier-row" style="--tc:${TIER_COLOR[tier]};--i:${i}">
      <div class="tier-side">
        ${embHTML(tier, i)}
        <div class="tier-epithet">${TIER_EPITHET[tier]}</div>
        <div class="tier-count"><b>${items.length}</b> ${plural(items.length,'тайтл','тайтла','тайтлов')}</div>
      </div>
      <div class="tier-cards view-${view}">`;
    if (!items.length) {
      html += `<div class="tier-empty">Пусто</div>`;
    } else {
      items.forEach((t, ci) => html += cardHTML(t, ci, view));
    }
    html += `</div></div>`;
  });
  const tl = $('#tierlist');
  tl.innerHTML = html;
  if (settings.rowAnim || settings.cascade) {
    tl.classList.remove('anim-in');
    void tl.offsetWidth;
    tl.classList.add('anim-in');
  }
  attachTilt(tl);
}
function embHTML(tier, i) {
  const c = TIER_COLOR[tier];
  const shapes = {
    SSS: `<polygon points="50,5 61,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 39,38"/>`,
    S: `<path d="M50 8 L85 30 L85 70 L50 92 L15 70 L15 30 Z"/>`,
    A: `<polygon points="50,5 95,50 50,95 5,50"/>`,
    B: `<circle cx="50" cy="50" r="42"/>`,
    C: `<polygon points="50,5 90,28 90,72 50,95 10,72 10,28"/>`,
    D: `<path d="M50 8 Q92 25 92 50 Q92 75 50 92 Q8 75 8 50 Q8 25 50 8 Z"/>`,
    E: `<polygon points="50,10 85,30 85,70 50,90 15,70 15,30"/>`
  };
  const letter = tier.length === 3 ? '<tspan font-size="10">SSS</tspan>' : tier;
  return `<div class="emb" data-tier="${tier}" style="--tc:${c};--i:${i}">
    <div class="emb-aura"></div>
    <div class="emb-ring"></div>
    <div class="emb-rot">
      <div class="emb-layer" style="--z:-18px;--lo:.35;--lb:.7"><svg viewBox="0 0 100 100"><g fill="${c}" opacity=".55">${shapes[tier]}</g></svg></div>
      <div class="emb-layer" style="--z:-6px;--lo:.7;--lb:.9"><svg viewBox="0 0 100 100"><g fill="${c}" opacity=".8">${shapes[tier]}</g></svg></div>
      <div class="emb-layer" style="--z:6px;--lo:1;--lb:1.1"><svg viewBox="0 0 100 100"><g fill="${c}">${shapes[tier]}</g></svg></div>
      <div class="emb-layer" style="--z:18px;--lo:1;--lb:1.25"><svg viewBox="0 0 100 100"><g fill="${c}" opacity=".9">${shapes[tier]}</g></svg></div>
      <div class="emb-letter">${tier}</div>
    </div>
    ${tier==='SSS'?`<svg class="emb-crown" viewBox="0 0 32 24"><path d="M2 20 L6 6 L12 14 L16 2 L20 14 L26 6 L30 20 Z" fill="#ffd76e" stroke="#b8860b" stroke-width="1"/><circle cx="6" cy="6" r="1.5" fill="#fff"/><circle cx="16" cy="2" r="1.5" fill="#fff"/><circle cx="26" cy="6" r="1.5" fill="#fff"/></svg>`:''}
    <div class="emb-shadow"></div>
  </div>`;
}
function cardHTML(t, ci, view) {
  const tc = TIER_COLOR[t.tier];
  const eps = titleEpisodes(t);
  const mins = titleMinutes(t);
  if (view === 'chips') {
    return `<div class="chipcard js-open" data-id="${t.id}" style="--tc:${tc};--ci:${ci}">
      <img src="${esc(coverSrc(t))}" alt="" loading="lazy" data-fb="${t.id}">
      <div class="cc-body"><div class="cc-name">${esc(t.name)}</div><div class="cc-meta">${TYPE_SHORT[t.type]}${eps?' · '+eps+' эп.':''}${mins?' · '+fmtDur(mins):''}</div></div>
      <div class="cc-tier">${t.tier}</div>
    </div>`;
  }
  if (view === 'list') {
    return `<div class="listcard js-open" data-id="${t.id}" style="--tc:${tc};--ci:${ci}">
      <img src="${esc(coverSrc(t))}" alt="" loading="lazy" data-fb="${t.id}">
      <div class="lc-body"><div class="lc-name">${esc(t.name)}</div><div class="lc-sub">${TYPE_SHORT[t.type]}${eps?' · '+eps+' эп.':''}${mins?' · '+fmtDur(mins):''}</div></div>
      <div class="lc-date">${fmtDate(t.date)}</div>
      <div class="lc-tier">${t.tier}</div>
    </div>`;
  }
  return `<div class="card js-open" data-id="${t.id}" style="--tc:${tc};--ci:${ci}">
    ${t.tier==='SSS'?`<svg class="card-crown" viewBox="0 0 32 24"><path d="M2 20 L6 6 L12 14 L16 2 L20 14 L26 6 L30 20 Z" fill="#ffd76e" stroke="#b8860b" stroke-width="1"/></svg>`:''}
    <div class="cover">
      <img src="${esc(coverSrc(t))}" alt="" loading="lazy" data-fb="${t.id}">
      <span class="type-tag">${TYPE_SHORT[t.type]||'TV'}</span>
      <span class="tier-badge">${t.tier}</span>
      <div class="cover-meta">
        ${eps?eps+' эп. · ':''}${fmtDur(mins)}<br>
        ${fmtDate(t.date)}
      </div>
    </div>
    <div class="card-title">${esc(t.name)}</div>
  </div>`;
}
function attachTilt(root) {
  if (!settings.tilt) return;
  root.querySelectorAll('.card, .chipcard').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const p = settings.tiltpow;
      el.style.transform = `perspective(700px) rotateY(${x*p}deg) rotateX(${-y*p}deg) ${settings.cardLift?'translateY(-6px)':''}`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ================= Рендер: хронология ================= */
function renderTimeline() {
  const events = [];
  state.titles.forEach(t => {
    (t.units || []).forEach(u => {
      if (u.date && u.date.y) events.push({ t, u, date:u.date, label:u.name || KIND[u.kind].label });
    });
    if (!t.units?.length && t.date && t.date.y) {
      events.push({ t, u:null, date:t.date, label:t.name });
    }
  });
  events.sort((a, b) => dateSortKey(b.date) - dateSortKey(a.date));
  const byYear = {};
  events.forEach((e, i) => {
    (byYear[e.date.y] = byYear[e.date.y] || []).push({ ...e, i });
  });
  const years = Object.keys(byYear).sort((a,b) => b - a);
  let html = '';
  years.forEach(y => {
    html += `<div class="tl-year"><b>${y}</b><span>${byYear[y].length} ${plural(byYear[y].length,'запись','записи','записей')}</span></div>`;
    byYear[y].forEach((e, i) => {
      const eps = titleEpisodes(e.t);
      const sNote = e.u ? `${e.label}${e.u.kind === 'film' ? (e.u.minutes ? ' · ' + e.u.minutes + ' мин' : ' · фильм') : (e.u.episodes ? ' · ' + e.u.episodes + ' эп.' : '')} · ` : '';
      html += `<div class="tl-row js-open" data-id="${e.t.id}" style="--d:${i*40}ms">
        <img src="${esc(coverSrc(e.t))}" alt="" loading="lazy" data-fb="${e.t.id}">
        <div>
          <div class="tl-name">${esc(e.t.name)}</div>
          <div class="tl-sub">${sNote}${TYPE_SHORT[e.t.type]} · тир ${e.t.tier}${eps?' · '+eps+' эп. всего':''} · ${fmtDate(e.date)}</div>
        </div>
        <div class="tl-date">${fmtDate(e.date)}</div>
      </div>`;
    });
  });
  $('#timeline').innerHTML = html || '<div class="tier-empty">Пока ничего не просмотрено</div>';
  setTimeout(() => $$('#timeline .tl-row').forEach(r => r.classList.add('in')), 50);
}

/* ================= Рендер: календарь ================= */
function calEvents() {
  const map = {};
  state.titles.forEach(t => {
    (t.units || []).forEach(u => {
      if (u.date && u.date.y && u.date.m && u.date.d) {
        const k = `${u.date.y}-${u.date.m}-${u.date.d}`;
        (map[k] = map[k] || []).push({ t, u, label:u.name || KIND[u.kind].label });
      }
    });
  });
  return map;
}
function renderCalendar() {
  const y = calDate.getFullYear(), m = calDate.getMonth();
  $('#cal-month-year') || ($('#cal-sel-m').innerHTML = MONTHS.map((n, i) => `<option value="${i}"${i===m?' selected':''}>${n}</option>`).join(''));
  const selM = $('#cal-sel-m'), selY = $('#cal-sel-y');
  if (!selM.children.length) selM.innerHTML = MONTHS.map((n, i) => `<option value="${i}">${n}</option>`).join('');
  selM.value = m;
  const years = new Set();
  state.titles.forEach(t => (t.units || []).forEach(u => u.date?.y && years.add(u.date.y)));
  const now = new Date().getFullYear();
  for (let yy = now - 5; yy <= now + 1; yy++) years.add(yy);
  const yrs = [...years].sort((a,b) => b - a);
  selY.innerHTML = yrs.map(yy => `<option value="${yy}"${yy===y?' selected':''}>${yy}</option>`).join('');
  renderCalGrid(y, m);
  renderCalList();
}
function renderCalGrid(y, m) {
  const first = new Date(y, m, 1);
  const startDow = (first.getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const isToday = (dd) => today.getFullYear() === y && today.getMonth() === m && today.getDate() === dd;
  const events = calEvents();
  let html = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => `<div class="cal-dow">${d}</div>`).join('');
  for (let i = 0; i < startDow; i++) html += `<div class="cal-cell out"></div>`;
  for (let dd = 1; dd <= dim; dd++) {
    const k = `${y}-${m+1}-${dd}`;
    const list = events[k] || [];
    const todayCls = isToday(dd) ? 'today' : '';
    const hasCls = list.length ? 'has' : '';
    let thumbs = '';
    if (list.length) {
      const shown = list.slice(0, 4);
      thumbs = shown.map(e => `<div class="cal-thumb"><img src="${esc(coverSrc(e.t))}" alt="" loading="lazy"><span class="s-badge">${e.t.tier}</span></div>`).join('');
      if (list.length > 4) thumbs += `<div class="cal-more">+${list.length - 4}</div>`;
    }
    html += `<div class="cal-cell ${todayCls} ${hasCls}" data-y="${y}" data-m="${m}" data-d="${dd}">
      <div class="cal-num">${dd}</div>
      <div class="cal-thumbs">${thumbs}</div>
    </div>`;
  }
  $('#cal-grid').innerHTML = html;
  $$('#cal-grid .cal-cell.has').forEach(el => el.onclick = () => openDay(+el.dataset.y, +el.dataset.m, +el.dataset.d));
}
function renderCalList() {
  const events = [];
  state.titles.forEach(t => {
    (t.units || []).forEach(u => {
      if (u.date && u.date.y) events.push({ t, u, date:u.date, label:u.name || KIND[u.kind].label });
    });
  });
  events.sort((a, b) => dateSortKey(b.date) - dateSortKey(a.date));
  const byYear = {};
  events.forEach(e => (byYear[e.date.y] = byYear[e.date.y] || []).push(e));
  const years = Object.keys(byYear).sort((a,b) => b - a);
  let html = '';
  years.forEach(y => {
    html += `<div class="cl-year"><b>${y}</b><span>${byYear[y].length} ${plural(byYear[y].length,'запись','записи','записей')}</span></div>`;
    byYear[y].forEach(e => {
      let dpart;
      if (e.date.d && e.date.m) dpart = `<b>${e.date.d}</b><span>${MON_S[e.date.m-1]}</span>`;
      else if (e.date.m) dpart = `<b class="mid">${MON_S[e.date.m-1]}</b><span>${e.date.y}</span>`;
      else dpart = `<b class="mid">${e.date.y}</b><span>год</span>`;
      const sNote = e.u ? `${e.label}${e.u.kind === 'film' ? (e.u.minutes ? ' · ' + e.u.minutes + ' мин' : ' · фильм') : (e.u.episodes ? ' · ' + e.u.episodes + ' эп.' : '')} · ` : '';
      const eps = titleEpisodes(e.t);
      html += `<div class="cl-row js-open" data-id="${e.t.id}">
        <div class="cl-date">${dpart}</div>
        <img src="${esc(coverSrc(e.t))}" alt="" loading="lazy" data-fb="${e.t.id}">
        <div class="cl-info">
          <div class="tl-name">${esc(e.t.name)}</div>
          <div class="tl-sub">${sNote}${TYPE_SHORT[e.t.type]} · тир ${e.t.tier}${eps?' · '+eps+' эп. всего':''} · ${fmtDate(e.date)}</div>
        </div>
        <span class="cl-tier" style="--tc:${TIER_COLOR[e.t.tier]}">${e.t.tier}</span>
      </div>`;
    });
  });
  $('#cal-list').innerHTML = html || '<div class="tier-empty">Нет записей</div>';
}
function openDay(y, m, d) {
  const list = calEvents()[`${y}-${m+1}-${d}`] || [];
  $('#m-day').innerHTML = `
    <button class="modal-x" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${d} ${MONTHS[m].toLowerCase()} ${y}</h2>
    ${list.map(e => `
      <div class="day-item js-open" data-id="${e.t.id}">
        <img src="${esc(coverSrc(e.t))}" alt="" loading="lazy">
        <div>
          <div class="tl-name">${esc(e.t.name)}</div>
          <div class="tl-sub">${e.label} · ${TYPE_SHORT[e.t.type]} · тир ${e.t.tier}</div>
        </div>
      </div>
    `).join('')}
  `;
  openModal('ov-day');
}

/* ================= Рендер: статистика ================= */
function renderStats() {
  const t = totals();
  const byTier = {}, byGenre = {}, byYear = {}, byType = {};
  TIERS.forEach(x => byTier[x] = 0);
  TYPES.forEach(x => byType[x.id] = 0);
  state.titles.forEach(ti => {
    byTier[ti.tier] = (byTier[ti.tier] || 0) + 1;
    byType[ti.type] = (byType[ti.type] || 0) + 1;
    (ti.genres || []).forEach(g => byGenre[g] = (byGenre[g] || 0) + 1);
    (ti.units || []).forEach(u => {
      if (u.date && u.date.y) byYear[u.date.y] = (byYear[u.date.y] || 0) + 1;
    });
  });
  const topGenres = Object.entries(byGenre).sort((a,b) => b[1] - a[1]).slice(0, 10);
  const topYears = Object.entries(byYear).sort((a,b) => b[0] - a[0]).slice(0, 8);
  const maxGenre = topGenres[0]?.[1] || 1;
  const maxYear = topYears[0]?.[1] || 1;
  const maxTier = Math.max(...Object.values(byTier), 1);
  const tasteScore = state.titles.reduce((a, ti) => a + TIER_SCORE[ti.tier] * (titleMinutes(ti) || 1), 0) /
                     Math.max(1, state.titles.reduce((a, ti) => a + (titleMinutes(ti) || 1), 0));
  const tastePct = Math.round(((tasteScore - 1) / 6) * 100);
  const verdict = tasteScore >= 6 ? 'Истинный ценитель' : tasteScore >= 5 ? 'Хороший вкус' : tasteScore >= 4 ? 'Разносторонний' : tasteScore >= 3 ? 'Непредвзятый' : 'Экспериментатор';
  const barsTiers = TIERS.map(tier => {
    const v = byTier[tier];
    const pct = (v / maxTier) * 100;
    return `<div class="bar"><div class="bar-l"><b style="color:${TIER_COLOR[tier]}">${tier}</b></div><div class="bar-track"><div class="bar-fill" style="background:${TIER_COLOR[tier]};width:0" data-w="${pct}%"></div></div><div class="bar-v">${v}</div></div>`;
  }).join('');
  const barsGenres = topGenres.map(([g, v]) => {
    const pct = (v / maxGenre) * 100;
    return `<div class="bar"><div class="bar-l"><b>${esc(g)}</b></div><div class="bar-track"><div class="bar-fill" style="background:var(--accent);width:0" data-w="${pct}%"></div></div><div class="bar-v">${v}</div></div>`;
  }).join('');
  const barsYears = topYears.map(([y, v]) => {
    const pct = (v / maxYear) * 100;
    return `<div class="bar"><div class="bar-l"><b>${y}</b></div><div class="bar-track"><div class="bar-fill" style="background:var(--accent);width:0" data-w="${pct}%"></div></div><div class="bar-v">${v}</div></div>`;
  }).join('');
  // donut по типам
  const dcol = { tv:'#ff7aa2', film:'#ffd76e', ova:'#9ddba8', ona:'#8fb8d6' };
  const C = 2 * Math.PI * 44;
  let segs = '', acc = 0;
  TYPES.forEach(tp => {
    const v = byType[tp.id] || 0;
    if (!v) return;
    const len = Math.max(v / t.n * C - 3, 0.5);
    segs += `<circle class="donut-seg" cx="50" cy="50" r="44" fill="none" stroke="${dcol[tp.id]}" stroke-width="11" stroke-dasharray="0 ${C.toFixed(2)}" data-dash="${len.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 50 50)"/>`;
    acc += v / t.n * C;
  });
  const legend = TYPES.map(tp => byType[tp.id] ? `<div class="dl-row"><span class="dl-dot" style="background:${dcol[tp.id]}"></span><b>${tp.label}</b><span class="dl-v">${byType[tp.id]}</span></div>` : '').join('');
  // heatmap
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ y: d.getFullYear(), m: d.getMonth() });
  }
  const dayCount = new Map();
  state.titles.forEach(ti => (ti.units || []).forEach(u => {
    if (u.date && u.date.y && u.date.m && u.date.d) {
      const k = `${u.date.y}-${u.date.m}-${u.date.d}`;
      dayCount.set(k, (dayCount.get(k) || 0) + 1);
    }
  }));
  const hmCols = months.map(({ y, m }) => {
    const dim = new Date(y, m + 1, 0).getDate();
    let cells = '';
    for (let dd = 1; dd <= 31; dd++) {
      if (dd > dim) { cells += `<span class="hm-cell ghost"></span>`; continue; }
      const n = dayCount.get(`${y}-${m+1}-${dd}`) || 0;
      const lvl = n === 0 ? 0 : n < 2 ? 1 : n < 4 ? 2 : 3;
      cells += `<span class="hm-cell" data-l="${lvl}" title="${dd}.${m+1}.${y} — ${n} ${plural(n,'запись','записи','записей')}"></span>`;
    }
    return `<div class="hm-col"><div class="hm-cells">${cells}</div><div class="hm-lab">${MON_S[m]}</div></div>`;
  }).join('');
  // рекорды
  const bigMin = state.titles.reduce((a, ti) => titleMinutes(ti) > titleMinutes(a) ? ti : a, state.titles[0] || null);
  const favG = topGenres[0];
  $('#stats').innerHTML = `
    <div class="stats-grid">
      <div class="stat-big">
        <div class="sb-item"><div class="sb-v" data-num="${t.n}">0</div><div class="sb-l">Тайтлов</div></div>
        <div class="sb-item"><div class="sb-v" data-num="${t.eps}">0</div><div class="sb-l">Серий просмотрено</div><div class="sb-s">${t.films} ${plural(t.films,'фильм','фильма','фильмов')}</div></div>
        <div class="sb-item"><div class="sb-v" data-num="${Math.round(t.min/60)}">0</div><div class="sb-l">Часов просмотра</div><div class="sb-s">${fmtDur(t.min)}</div></div>
        <div class="sb-item sm"><div class="sb-v" data-num="${Math.round(t.min/1440)}">0</div><div class="sb-l">Дней жизни</div></div>
        <div class="taste">
          <div class="taste-head"><b>Индекс вкуса</b><div class="taste-score">${tastePct}</div></div>
          <div class="taste-scale"><div class="taste-mark" style="left:0%"><svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5-6.5-4.5-6.5 4.5 2.5-7.5-6-4.5h7.5z"/></svg></div></div>
          <div class="taste-ticks"><span>1</span><span>4</span><span>7</span></div>
          <div class="taste-verdict">«${verdict}»</div>
        </div>
      </div>
      <div class="bars">
        <div class="donut-panel">
          <h3>Состав коллекции</h3>
          <div class="donut-wrap">
            <svg class="donut" viewBox="0 0 100 100">${segs}<text x="50" y="48" class="donut-n">${t.n}</text><text x="50" y="58" class="donut-l">ТАЙТЛОВ</text></svg>
            <div class="donut-legend">${legend}</div>
          </div>
        </div>
        <h3>По тирам</h3>${barsTiers}
        <h3>По жанрам · топ-10</h3>${barsGenres}
        <h3>По годам просмотра</h3>${barsYears}
        <p class="bar-note">Время считается так: сезоны, спешлы и OVA/ONA-эпизоды × длительность серии, фильмы × длительность.</p>
      </div>
    </div>
    <div class="bars" style="margin-top:30px">
      <h3>Активность · последние 12 месяцев</h3>
      <div class="heatmap-wrap">${hmCols}</div>
      <div class="hm-legend"><span>меньше</span><i style="background:var(--panel2)"></i><i style="background:color-mix(in srgb,var(--accent) 30%,var(--panel2))"></i><i style="background:color-mix(in srgb,var(--accent) 60%,var(--panel2))"></i><i style="background:var(--accent)"></i><span>больше</span></div>
    </div>
    ${bigMin ? `<div class="bars" style="margin-top:30px"><h3>Рекорды</h3><div class="rec-grid">
      <div class="rec-card js-open" data-id="${bigMin.id}"><div class="rec-k">Больше всех времени</div><div class="rec-v">${esc(bigMin.name)}</div><div class="rec-s">≈ ${fmtDur(titleMinutes(bigMin))} · тир ${bigMin.tier}</div></div>
      ${favG ? `<div class="rec-card"><div class="rec-k">Любимый жанр</div><div class="rec-v">${esc(favG[0])}</div><div class="rec-s">${favG[1]} ${plural(favG[1],'тайтл','тайтла','тайтлов')} · ${(favG[1]/t.n*100).toFixed(0)}% коллекции</div></div>` : ''}
    </div></div>` : ''}
  `;
  $$('#stats .sb-v').forEach(el => animNum(el, +el.dataset.num));
  setTimeout(() => {
    $$('#stats .bar-fill').forEach(el => el.style.width = el.dataset.w);
    $$('#stats .donut-seg').forEach(el => el.setAttribute('stroke-dasharray', el.dataset.dash));
    const mark = $('#stats .taste-mark');
    if (mark) mark.style.left = tastePct + '%';
  }, 100);
}

/* ================= Модалки ================= */
function openModal(id) {
  $('#' + id).classList.remove('hidden');
  requestAnimationFrame(() => $('#' + id).classList.add('active'));
}
function closeModal(id) {
  $('#' + id).classList.remove('active');
  setTimeout(() => $('#' + id).classList.add('hidden'), 320);
}
function closeAllModals() {
  $$('.overlay').forEach(o => { o.classList.remove('active'); setTimeout(() => o.classList.add('hidden'), 320); });
  document.body.classList.remove('drawer-open');
}

/* ================= Детали тайтла ================= */
function openTitle(id) {
  const t = state.titles.find(x => x.id === id);
  if (!t) return;
  const u = t.units || [];
  const eps = titleEpisodes(t), films = titleFilms(t);
  const seasonsN = u.filter(x => x.kind === 'season').length;
  const specs = [];
  if (t.type === 'tv') {
    specs.push(['Сезоны', seasonsN || '—']);
    const se = u.filter(x => x.kind === 'season').reduce((a, x) => a + x.episodes, 0);
    const extras = [];
    ['special','ova','ona'].forEach(k => {
      const n = u.filter(x => x.kind === k).reduce((a, x) => a + x.episodes, 0);
      if (n) extras.push(`${KIND[k].label} ${n}`);
    });
    specs.push(['Серии', eps + (extras.length ? ` (${se} + ${extras.join(' + ')})` : '')]);
  }
  specs.push(['Фильмы', films || '—']);
  specs.push(['Время', fmtDur(titleMinutes(t))]);
  specs.push(['Тир', t.tier]);
  specs.push(['Добавлено', fmtDate({ y: new Date(t.createdAt || Date.now()).getFullYear(), m: new Date(t.createdAt || Date.now()).getMonth() + 1, d: new Date(t.createdAt || Date.now()).getDate() })]);
  const unitsHTML = u.map(x => `<div class="dt-unit" style="--uc:${KIND[x.kind].color}"><b>${KIND[x.kind].badge}</b><div class="du-name">${esc(x.name || KIND[x.kind].label)}</div><div class="du-eps">${x.kind === 'film' ? (x.minutes ? x.minutes + ' мин' : '—') : (x.episodes ? x.episodes + ' эп.' : '—')}</div><div class="du-date">${fmtDate(x.date)}</div></div>`).join('');
  $('#m-title').innerHTML = `
    <button class="modal-x" data-close><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <div class="dt-grid">
      <div class="dt-cover"><img src="${esc(coverSrc(t))}" alt=""></div>
      <div class="dt-info">
        <div class="dt-tierline"><span class="tier-badge" style="--tc:${TIER_COLOR[t.tier]}">${t.tier}</span><span class="dt-type">${TYPE_SHORT[t.type]}</span></div>
        <h2 class="dt-name">${esc(t.name)}</h2>
        <div class="dt-genres">${(t.genres || []).map(g => `<span>${esc(g)}</span>`).join('')}</div>
        <div class="du-head">Структура просмотра</div>
        <div class="dt-units">${unitsHTML || '<div class="tier-empty">Не указано</div>'}</div>
        <dl class="dt-specs">${specs.map(([k, v]) => `<div class="dt-spec"><dt>${k}</dt><dd${k==='Тир'?' class="accent"':''}>${v}</dd></div>`).join('')}</dl>
        ${t.notes ? `<div class="dt-notes">${esc(t.notes)}</div>` : ''}
        <div class="dt-actions">
          <button class="btn" data-edit="${t.id}"><svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>Редактировать</button>
          <button class="btn btn-danger" data-del="${t.id}"><svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>Удалить</button>
        </div>
      </div>
    </div>
  `;
  openModal('ov-title');
}

/* ================= Форма ================= */
function openForm(id = null) {
  editingId = id;
  const t = id ? state.titles.find(x => x.id === id) : null;
  $('#form-title').textContent = t ? 'Редактировать тайтл' : 'Новый тайтл';
  $('#f-name').value = t?.name || '';
  $('#f-cover-url').value = (t?.cover && !t.cover.startsWith('data:')) ? t.cover : '';
  formCoverData = (t?.cover && t.cover.startsWith('data:')) ? t.cover : null;
  updatePreview();
  // тир
  $('#f-tier').innerHTML = TIERS.map(tier => `<button type="button" class="seg-btn" data-tier="${tier}" style="--tc:${TIER_COLOR[tier]}">${tier}</button>`).join('');
  $$('#f-tier .seg-btn').forEach(b => {
    b.classList.toggle('on', b.dataset.tier === (t?.tier || 'B'));
    b.onclick = () => { $$('#f-tier .seg-btn').forEach(x => x.classList.remove('on')); b.classList.add('on'); };
  });
  // тип
  $('#f-type').innerHTML = TYPES.map(tp => `<button type="button" class="seg-btn" data-type="${tp.id}">${tp.label}</button>`).join('');
  $$('#f-type .seg-btn').forEach(b => {
    b.classList.toggle('on', b.dataset.type === (t?.type || 'tv'));
    b.onclick = () => { $$('#f-type .seg-btn').forEach(x => x.classList.remove('on')); b.classList.add('on'); updateFormByType(); };
  });
  // жанры
  renderFormGenres(t?.genres || []);
  // units
  renderUnits(t?.units || [], t?.type || 'tv');
  // заметка
  $('#f-notes').value = t?.notes || '';
  updateFormByType();
  openModal('ov-form');
}
function updatePreview() {
  const img = $('#f-preview');
  if (formCoverData) img.src = formCoverData;
  else if ($('#f-cover-url').value) img.src = $('#f-cover-url').value;
  else img.src = '';
}
function updateFormByType() {
  const type = $('#f-type .seg-btn.on')?.dataset.type || 'tv';
  $('#units-label').textContent = type === 'film' ? 'Детали фильма' : 'Структура просмотра';
}
function renderFormGenres(selected) {
  const selSet = new Set(selected);
  $('#f-genres-selected').innerHTML = selected.map(g => `<span data-g="${esc(g)}">${esc(g)} <i>×</i></span>`).join('');
  $$('#f-genres-selected span i').forEach(i => i.onclick = () => {
    const g = i.parentElement.dataset.g;
    selSet.delete(g);
    renderFormGenres([...selSet]);
  });
  const q = ($('#f-genre-search')?.value || '').toLowerCase();
  const list = GENRES.filter(g => !selSet.has(g) && (!q || g.toLowerCase().includes(q))).slice(0, 60);
  $('#f-genres').innerHTML = list.map(g => `<span class="chip" data-g="${esc(g)}">${esc(g)}</span>`).join('');
  $$('#f-genres .chip').forEach(el => el.onclick = () => {
    selSet.add(el.dataset.g);
    renderFormGenres([...selSet]);
  });
}
function renderUnits(units, type) {
  const box = $('#units-box');
  box.classList.toggle('has-err', false);
  // кнопки добавления
  const kinds = type === 'film' ? ['film'] : ['season','film','special','ova','ona'];
  $('#units-add').innerHTML = kinds.map(k => `<button type="button" class="u-add" data-k="${k}" style="--kc:${KIND[k].color}"><i></i>${KIND[k].label}</button>`).join('');
  $$('#units-add .u-add').forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    units.push({ kind:k, name:'', episodes: k==='film'?0:12, minutes: k==='film'?null:null, date:null });
    renderUnitsList(units, type);
    updateUnitsSum(units);
  });
  renderUnitsList(units, type);
  updateUnitsSum(units);
}
function renderUnitsList(units, type) {
  const list = $('#units-list');
  list.classList.toggle('scrolled', units.length > 6);
  list.innerHTML = units.map((r, i) => {
    const k = KIND[r.kind];
    const isFilm = r.kind === 'film';
    const typeSel = `<select data-k="kind"><option value="season"${r.kind==='season'?' selected':''}>Сезон</option><option value="film"${r.kind==='film'?' selected':''}>Фильм</option><option value="special"${r.kind==='special'?' selected':''}>Спешл</option><option value="ova"${r.kind==='ova'?' selected':''}>OVA</option><option value="ona"${r.kind==='ona'?' selected':''}>ONA</option></select>`;
    const phName = isFilm ? 'Название фильма (необязательно)' : 'Название (напр. Сезон 2)';
    return `<div class="urow ${type==='film'?'nosel':''}" data-i="${i}" style="--uc:${k.color}">
      <span class="urow-badge" title="${esc(k.label)}">${k.badge}</span>
      ${type==='film'?'':typeSel}
      <input type="text" placeholder="${phName}" value="${esc(r.name)}" data-k="name" maxlength="80" autocomplete="off">
      <input type="number" min="0" max="5000" placeholder="${isFilm?'мин':'серий'}" value="${r.kind==='film'?(r.minutes||''):(r.episodes||'')}" data-k="count" autocomplete="off">
      <input placeholder="ДД.ММ.ГГГГ" value="${esc(r.date ? (r.date.d ? `${r.date.d}.${r.date.m}.${r.date.y}` : (r.date.m ? `${r.date.m}.${r.date.y}` : `${r.date.y}`)) : '')}" data-k="date" autocomplete="off">
      <button type="button" class="srow-del" data-del="${i}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>`;
  }).join('');
  // bind
  list.querySelectorAll('.urow').forEach(row => {
    const i = +row.dataset.i;
    row.querySelectorAll('[data-k]').forEach(inp => {
      inp.oninput = inp.onchange = () => {
        const k = inp.dataset.k;
        if (k === 'name') units[i].name = inp.value;
        else if (k === 'count') {
          if (units[i].kind === 'film') units[i].minutes = +inp.value || null;
          else units[i].episodes = +inp.value || 0;
        }
        else if (k === 'date') {
          units[i].date = normDate(inp.value);
          row.classList.toggle('err', inp.value && !units[i].date);
        }
        else if (k === 'kind') {
          units[i].kind = inp.value;
          renderUnits(units, type);
        }
        updateUnitsSum(units);
      };
    });
    row.querySelector('[data-del]').onclick = () => {
      units.splice(i, 1);
      renderUnits(units, type);
    };
  });
}
function updateUnitsSum(units) {
  let eps = 0, mins = 0;
  units.forEach(u => {
    if (u.kind === 'film') mins += (u.minutes || settings.filmMin);
    else { eps += (u.episodes || 0); mins += (u.episodes || 0) * (u.minutes || settings.epMin); }
  });
  $('#units-sum').textContent = `${units.length} ${plural(units.length,'часть','части','частей')} · ${eps} эп. · ≈ ${fmtDur(mins)}`;
  $('#f-estimate').textContent = `Итого: ≈ ${fmtDur(mins)}`;
}
function saveForm() {
  const name = $('#f-name').value.trim();
  if (!name) { $('#w-name').classList.add('error'); return; }
  $('#w-name').classList.remove('error');
  const tier = $('#f-tier .seg-btn.on')?.dataset.tier || 'B';
  const type = $('#f-type .seg-btn.on')?.dataset.type || 'tv';
  const cover = formCoverData || $('#f-cover-url').value.trim();
  const genres = [...$$('#f-genres-selected span')].map(s => s.dataset.g);
  const units = [];
  let hasErr = false;
  $$('#units-list .urow').forEach(row => {
    const i = +row.dataset.i;
    if (row.classList.contains('err')) hasErr = true;
  });
  // перечитываем units из DOM
  const existingUnits = editingId ? (state.titles.find(x => x.id === editingId)?.units || []) : [];
  // используем актуальные данные из формы
  $$('#units-list .urow').forEach(row => {
    const i = +row.dataset.i;
    const u = existingUnits[i] || {};
    const kind = row.querySelector('[data-k="kind"]')?.value || u.kind || 'season';
    const nameU = row.querySelector('[data-k="name"]').value;
    const count = +row.querySelector('[data-k="count"]').value || 0;
    const dateStr = row.querySelector('[data-k="date"]').value;
    const date = normDate(dateStr);
    if (dateStr && !date) hasErr = true;
    if (kind === 'film') units.push({ kind, name:nameU, episodes:0, minutes:count||null, date });
    else units.push({ kind, name:nameU, episodes:count, minutes:null, date });
  });
  if (hasErr) { $('#units-box').classList.add('has-err'); return; }
  const lastDate = units.filter(u => u.date).sort((a,b) => dateSortKey(b.date) - dateSortKey(a.date))[0]?.date || null;
  const notes = $('#f-notes').value.trim();
  if (editingId) {
    const t = state.titles.find(x => x.id === editingId);
    Object.assign(t, { name, tier, type, cover, genres, units, date:lastDate, minutes:null, episodes:0, notes });
  } else {
    state.titles.push({
      id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      createdAt: Date.now(),
      name, tier, type, cover, genres, units,
      date: lastDate, minutes: null, episodes: 0, notes
    });
  }
  state.updatedAt = Date.now();
  persist();
  closeModal('ov-form');
  renderAll();
  toast(editingId ? 'Тайтл обновлён' : 'Тайтл добавлен', 'ok');
  if (window.pushToGitHub) window.pushToGitHub();
  editingId = null;
}

/* ================= Render All ================= */
function renderAll() {
  renderHero();
  renderTierTotal();
  renderRecent();
  renderFilters();
  renderTierlist();
}

/* ================= Инициализация ================= */
function init() {
  applySettings();
  renderAll();
  renderNav();
  window.addEventListener('resize', renderNav);

  // навигация
  $$('.nav-btn').forEach(b => b.onclick = () => switchView(b.dataset.view));
  $('#drawer-x').onclick = () => document.body.classList.remove('drawer-open');

  // кнопки добавить
  $$('#btn-add, [data-act="add"]').forEach(b => b.onclick = () => openForm());
  $('#btn-random').onclick = () => {
    if (!state.titles.length) { toast('Каталог пуст', 'warn'); return; }
    const t = state.titles[Math.floor(Math.random() * state.titles.length)];
    openTitle(t.id);
  };

  // делегирование кликов по карточкам
  document.addEventListener('click', e => {
    const open = e.target.closest('.js-open');
    if (open && open.dataset.id) { openTitle(open.dataset.id); return; }
    const edit = e.target.closest('[data-edit]');
    if (edit) { closeModal('ov-title'); openForm(edit.dataset.edit); return; }
    const del = e.target.closest('[data-del]');
    if (del) { confirmDelete(del.dataset.del); return; }
  });

  // закрытие модалок
  $$('[data-close]').forEach(b => b.onclick = () => closeAllModals());
  $$('.overlay').forEach(o => o.onclick = e => { if (e.target === o) closeAllModals(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
    if (e.key === '/' && !e.target.matches('input,textarea,select')) { e.preventDefault(); $('#f-search')?.focus(); }
  });

  // форма
  $('#title-form').onsubmit = e => { e.preventDefault(); saveForm(); };
  $('#f-cover-url').oninput = updatePreview;
  $('#f-cover-file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => { formCoverData = ev.target.result; updatePreview(); };
    r.readAsDataURL(f);
  };
  $('#f-cover-clear').onclick = () => { formCoverData = null; $('#f-cover-url').value = ''; updatePreview(); };
  $('#f-genre-search').oninput = () => {
    const sel = new Set([...$$('#f-genres-selected span')].map(s => s.dataset.g));
    renderFormGenres([...sel]);
  };
  $('#f-genre-add').onclick = () => {
    const v = $('#f-genre-new').value.trim();
    if (!v) return;
    const sel = new Set([...$$('#f-genres-selected span')].map(s => s.dataset.g));
    sel.add(v);
    renderFormGenres([...sel]);
    $('#f-genre-new').value = '';
  };

  // календарь
  $('#cal-prev').onclick = () => { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); };
  $('#cal-next').onclick = () => { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); };
  $('#cal-today').onclick = () => { calDate = new Date(); renderCalendar(); };
  $('#cal-sel-m').onchange = e => { calDate.setMonth(+e.target.value); renderCalGrid(calDate.getFullYear(), calDate.getMonth()); };
  $('#cal-sel-y').onchange = e => { calDate.setFullYear(+e.target.value); renderCalGrid(calDate.getFullYear(), calDate.getMonth()); };
  $('#cal-mode-grid').onclick = () => { calMode = 'grid'; $('#cal-mode-grid').classList.add('on'); $('#cal-mode-list').classList.remove('on'); $('#cal-grid-wrap').classList.remove('hidden'); $('#cal-list-wrap').classList.add('hidden'); };
  $('#cal-mode-list').onclick = () => { calMode = 'list'; $('#cal-mode-list').classList.add('on'); $('#cal-mode-grid').classList.remove('on'); $('#cal-list-wrap').classList.remove('hidden'); $('#cal-grid-wrap').classList.add('hidden'); };

  // настройки — переключатели
  const boolMap = {
    anim:'s-anim', particles:'s-particles', petsFront:'s-petsfront', pspin:'s-pspin', twinkle:'s-twinkle',
    branches:'s-branches', sway:'s-sway', ambient:'s-ambient', moon:'s-moon',
    rowAnim:'s-rowanim', cascade:'s-cascade', tierBg:'s-tierbg', modalPop:'s-modalpop', toastAnim:'s-toastanim', pillGlow:'s-pillglow',
    tilt:'s-tilt', cardLift:'s-lift', glow:'s-glow', shine:'s-shine',
    counters:'s-counters', recent:'s-recent', light:'s-light', tierGlow:'s-tierglow'
  };
  for (const [key, id] of Object.entries(boolMap)) {
    const el = $('#' + id); if (!el) continue;
    el.checked = !!settings[key];
    el.onchange = e => { settings[key] = e.target.checked; persistSettings(); applySettings(); renderAll(); };
  }
  // селекты
  const selMap = { catView:'sel-catview', embanim:'sel-embanim', pstyle:'sel-pstyle', bstyle:'sel-bstyle', tempo:'sel-tempo' };
  for (const [key, id] of Object.entries(selMap)) {
    const el = $('#' + id); if (!el) continue;
    el.value = settings[key];
    el.onchange = e => { settings[key] = e.target.value; persistSettings(); applySettings(); renderAll(); };
  }
  // заполняем селекты частиц и деревьев
  $('#sel-pstyle').innerHTML = Object.keys(Particles.PRESETS).map(k => `<option value="${k}">${k}</option>`).join('');
  $('#sel-pstyle').value = settings.pstyle;
  $('#sel-bstyle').innerHTML = Object.keys(Trees.BRANCH_STYLES).map(k => `<option value="${k}">${k}</option>`).join('');
  $('#sel-bstyle').value = settings.bstyle;
  // ranges
  const range = (rid, vid, key, fmt, after) => {
    const r = $('#' + rid); if (!r) return;
    r.value = settings[key];
    $('#' + vid).textContent = fmt(settings[key]);
    r.oninput = () => { settings[key] = +r.value; $('#' + vid).textContent = fmt(+r.value); if (after) after(); Particles.refresh(); persistSettings(); };
  };
  range('s-embanimspd', 'v-embanimspd', 'embanimspd', v => v + ' с');
  range('s-density', 'v-density', 'density', v => v);
  range('s-fall', 'v-fall', 'fall', v => v);
  range('s-psize', 'v-psize', 'psize', v => v + '%');
  range('s-palpha', 'v-palpha', 'palpha', v => v + '%');
  range('s-wind', 'v-wind', 'wind', v => v);
  range('s-parallax', 'v-parallax', 'parallax', v => v);
  range('s-balpha', 'v-balpha', 'balpha', v => v + '%');
  range('s-bgdim', 'v-bgdim', 'bgdim', v => v + '%');
  range('s-tiltpow', 'v-tiltpow', 'tiltpow', v => '±' + v + '°');
  range('s-cntspd', 'v-cntspd', 'cntspd', v => v + ' мс');
  range('s-panelop', 'v-panelop', 'panelop', v => v + '%', applySettings);
  range('s-radius', 'v-radius', 'radius', v => v + ' px', applySettings);

  // акценты
  $$('#acc-pick button').forEach(b => {
    b.classList.toggle('on', settings.accent === b.dataset.acc);
    b.onclick = () => {
      settings.accent = b.dataset.acc;
      $$('#acc-pick button').forEach(x => x.classList.toggle('on', x === b));
      persistSettings(); applySettings();
    };
  });

  // длительности
  $('#s-epmin').value = settings.epMin;
  $('#s-filmmin').value = settings.filmMin;
  $('#s-epmin').onchange = e => { settings.epMin = +e.target.value; persistSettings(); renderAll(); };
  $('#s-filmmin').onchange = e => { settings.filmMin = +e.target.value; persistSettings(); renderAll(); };

  // фон
  $('#bg-file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      document.body.classList.add('has-bg');
      $('#user-bg').style.setProperty('--user-img', `url(${ev.target.result})`);
      localStorage.setItem('animeArchive_bg', ev.target.result);
    };
    r.readAsDataURL(f);
  };
  $('#bg-remove').onclick = () => {
    document.body.classList.remove('has-bg');
    $('#user-bg').style.removeProperty('--user-img');
    localStorage.removeItem('animeArchive_bg');
  };
  const savedBg = localStorage.getItem('animeArchive_bg');
  if (savedBg) { document.body.classList.add('has-bg'); $('#user-bg').style.setProperty('--user-img', `url(${savedBg})`); }

  // сброс настроек
  $('#btn-reset-set').onclick = () => {
    if (!confirm('Сбросить все настройки?')) return;
    localStorage.removeItem(LS_SETTINGS);
    settings = loadSettings();
    applySettings();
    location.reload();
  };

  // экспорт/импорт
  $('#btn-export').onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `anime-archive-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };
  $('#btn-import').onclick = () => $('#file-import').click();
  $('#file-import').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d && Array.isArray(d.titles)) {
          state = d;
          persist();
          renderAll();
          toast('Импортировано: ' + d.titles.length + ' тайтлов', 'ok');
        } else toast('Неверный формат файла', 'warn');
      } catch(err) { toast('Ошибка чтения: ' + err.message, 'warn'); }
    };
    r.readAsText(f);
    e.target.value = '';
  };

  // кнопка наверх
  const toTop = $('#to-top');
  window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 600));
  toTop.onclick = () => window.scrollTo({ top:0, behavior:'smooth' });

  // загрузка данных из data.json при первом запуске
  if (!state.titles.length) {
    fetch(DATA_PATH).then(r => r.ok ? r.json() : null).then(d => {
      if (d && d.titles && d.titles.length) {
        state = d;
        persist();
        renderAll();
      }
    }).catch(() => {});
  }
}

function confirmDelete(id) {
  const t = state.titles.find(x => x.id === id);
  if (!t) return;
  $('#m-confirm').innerHTML = `
    <button class="modal-x" data-close><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>Удалить тайтл?</h2>
    <p>«${esc(t.name)}» будет удалён безвозвратно.</p>
    <div class="form-foot">
      <button class="btn" data-close>Отмена</button>
      <button class="btn btn-danger" id="confirm-del">Удалить</button>
    </div>
  `;
  openModal('ov-confirm');
  $('#confirm-del').onclick = () => {
    state.titles = state.titles.filter(x => x.id !== id);
    state.updatedAt = Date.now();
    persist();
    closeModal('ov-confirm');
    closeModal('ov-title');
    renderAll();
    toast('Тайтл удалён', 'ok');
    if (window.pushToGitHub) window.pushToGitHub();
  };
}

document.addEventListener('DOMContentLoaded', init);
