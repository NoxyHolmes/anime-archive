'use strict';
/* ================= константы ================= */
const TIERS = ['SSS', 'S', 'A', 'B', 'C', 'D', 'E'];
const TIER_COLOR = { SSS: '#ffd76e', S: '#ff4d6d', A: '#a78bfa', B: '#38bdf8', C: '#34d399', D: '#fb923c', E: '#94a3b8' };
const TIER_EPITHET = { SSS: 'Шедевры', S: 'Элита', A: 'Отличные', B: 'Хорошие', C: 'Средние', D: 'Слабые', E: 'Провал' };
const TIER_SCORE = { SSS: 7, S: 6, A: 5, B: 4, C: 3, D: 2, E: 1 };
const TYPES = [{ id: 'tv', label: 'Сериал' }, { id: 'film', label: 'Фильм' }, { id: 'ova', label: 'OVA' }, { id: 'ona', label: 'ONA' }];
const TYPE_SHORT = { tv: 'TV', film: 'ФИЛЬМ', ova: 'OVA', ona: 'ONA' };
const KIND = {
  season: { label: 'Сезон', badge: 'S', color: '#ff7aa2' },
  film: { label: 'Фильм', badge: 'Ф', color: '#ffd76e' },
  special: { label: 'Спешл', badge: 'СП', color: '#b18cff' },
  ova: { label: 'OVA', badge: 'OV', color: '#9ddba8' },
  ona: { label: 'ONA', badge: 'ON', color: '#8fb8d6' }
};
const KIND_ORDER = Object.keys(KIND);
const DEF_KIND = { tv: 'season', film: 'film', ova: 'ova', ona: 'ona' };
const GENRES = ['Альтернативная история', 'Альтернативная реальность', 'Ангелы', 'Андроиды', 'Антивойна', 'Антиутопия', 'Баскетбол', 'Безумие', 'Бисёнэн', 'Боевые искусства', 'Божества', 'Вампиры', 'Ведьмы', 'Вестерн', 'Виртуальная реальность', 'Военная тематика', 'Война', 'Воры', 'Гарем', 'Гарем (для девочек)', 'Гендерная интрига', 'Демоны', 'Детектив', 'Дзёсэй', 'Драконы', 'Драма', 'Зомби', 'Игры', 'Инопланетные расы', 'Искусственный интеллект', 'Искусство', 'Исэкай', 'Исторический', 'Киберпанк', 'Киборги', 'Китайское 3D', 'Комедия', 'Космос', 'Кулинария', 'Лоликон', 'Любовный треугольник', 'Магия', 'Манга', 'Мафия/Якудза', 'Махо-сёдзё', 'Машины', 'Медицина', 'Меха', 'Мистика', 'Мотоциклы', 'Музыка', 'Не японское', 'Нелинейный сюжет', 'Ниндзя', 'Охотники за головами', 'Параллельный мир', 'Пародия', 'Перестрелки', 'Пилотируемые роботы', 'Пираты', 'Повседневность', 'Политика', 'Полицейские', 'Полулюди', 'Постапокалиптика', 'Преступный мир', 'Призраки', 'Приключения', 'Прокси бои', 'Психология', 'Путешествия во времени', 'Романтика', 'Русалки', 'Русские в аниме', 'Самураи', 'Сверхъестественное', 'Силовые костюмы', 'Современное фэнтези', 'Спорт', 'Сражения на мечах', 'Стимпанк', 'Суккубы', 'Суперспособности', 'Сэйнэн', 'Сёдзё', 'Сёдзё-ай', 'Сёнэн', 'Сёнэн-ай', 'Тайный заговор', 'Темное фэнтези', 'Темные эльфы', 'Террористы', 'Трансформеры', 'Триллер', 'Убийцы', 'Ужасы', 'Фантастика', 'Феи', 'Фэнтези', 'Хулиганы', 'Целый фэнтези мир', 'Школьная жизнь', 'Экшен', 'Эльфы', 'Эротика', 'Этти'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MON_S = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const ACCENTS = { sakura: '#ff7aa2', flame: '#ff6b4a', violet: '#b18cff', mint: '#6fd6b1' };
const DATA_PATH = 'anime-data.json';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const CROWN = `<svg viewBox="0 0 24 14" width="100%"><path d="M2 12 L3 4 L7 8 L12 2 L17 8 L21 4 L22 12 Z" fill="#ffd76e" stroke="#c9932a" stroke-width="1" stroke-linejoin="round"/><circle cx="12" cy="2" r="1.4" fill="#fff3c4"/><circle cx="3" cy="4" r="1" fill="#fff3c4"/><circle cx="21" cy="4" r="1" fill="#fff3c4"/></svg>`;
const CROWN_MINI = `<svg viewBox="0 0 24 14" width="13" height="9"><path d="M2 12 L3 4 L7 8 L12 2 L17 8 L21 4 L22 12 Z" fill="#ffd76e" stroke="#c9932a" stroke-width="1"/></svg>`;

/* ---- пресеты частиц (20 стилей) ---- */
const PRESETS = {
  sakura: { label: 'Сакура · лепестки', shape: 'petal', colors: ['#ffdce8', '#ffc6d9', '#ffb0cb', '#ff9dc4', '#fff0f5'], size: [4.5, 11], vy: [.5, 1.5], sway: [.6, 2.0], alpha: [.55, .95] },
  hanami: { label: 'Ханами · крупные бело-розовые', shape: 'petal', colors: ['#ffeaf2', '#ffd6e4', '#fff5f8', '#ffcfe0'], size: [6, 14], vy: [.4, 1.1], sway: [.8, 2.4], alpha: [.6, 1] },
  white: { label: 'Белые лепестки', shape: 'petal', colors: ['#ffffff', '#fff7fa', '#ffeef4'], size: [4.5, 11], vy: [.5, 1.4], sway: [.6, 1.8], alpha: [.5, .9] },
  rose: { label: 'Розы · красные лепестки', shape: 'petal', colors: ['#ff8fa3', '#ff5c8a', '#ffb3c1', '#ff7aa2'], size: [4.5, 10], vy: [.5, 1.3], sway: [.6, 1.9], alpha: [.6, .95] },
  lavender: { label: 'Лаванда · сиреневые', shape: 'petal', colors: ['#d9c2ff', '#c7a8ff', '#e8dbff', '#b18cff'], size: [4.5, 10], vy: [.5, 1.3], sway: [.6, 1.9], alpha: [.55, .95] },
  sky: { label: 'Небо · голубые лепестки', shape: 'petal', colors: ['#bfe3ff', '#9fd0ff', '#d8ecff', '#8fc3ff'], size: [4.5, 10], vy: [.5, 1.3], sway: [.6, 1.8], alpha: [.55, .95] },
  night: { label: 'Ночная сакура · неон', shape: 'petal', colors: ['#ff7aa2', '#b18cff', '#7ad0ff', '#ff9dc4'], size: [4, 9], vy: [.4, 1.1], sway: [.6, 1.8], alpha: [.4, .85], glow: true },
  mono: { label: 'Монохром', shape: 'petal', colors: ['#ffffff', '#e8e8ee', '#dcdce4'], size: [4.5, 10], vy: [.5, 1.3], sway: [.6, 1.8], alpha: [.5, .9] },
  sakurasnow: { label: 'Сакура + снег', shape: ['petal', 'flake'], colors: ['#ffdce8', '#ffc6d9', '#ffffff', '#ffb0cb', '#f2f7ff'], size: [3, 9], vy: [.45, 1.2], sway: [.5, 1.6], alpha: [.55, .95] },
  snow: { label: 'Зима · снег', shape: 'flake', colors: ['#ffffff', '#f2f7ff', '#e8f1ff'], size: [2.5, 6.5], vy: [.4, 1.1], sway: [.4, 1.2], alpha: [.6, 1] },
  softsnow: { label: 'Мягкий мелкий снег', shape: 'flake', colors: ['#ffffff', '#f4f8ff'], size: [1.5, 4], vy: [.25, .7], sway: [.3, 1], alpha: [.45, .8] },
  blizzard: { label: 'Метель', shape: 'flake', colors: ['#ffffff', '#eaf3ff'], size: [2, 6], vy: [1.8, 3.4], sway: [.3, .9], alpha: [.5, .95] },
  crystal: { label: 'Кристаллы · голубые', shape: 'flake', colors: ['#cfe8ff', '#a8d8ff', '#e8f4ff'], size: [2.5, 6], vy: [.35, 1], sway: [.4, 1.2], alpha: [.5, .95], glow: true },
  autumn: { label: 'Осень · листья', shape: 'leaf', colors: ['#ffb347', '#ff8c42', '#e2574c', '#d96c3f', '#c9452f'], size: [5, 10], vy: [.6, 1.4], sway: [1, 2.6], alpha: [.6, .95] },
  maple: { label: 'Клён · красные листья', shape: 'leaf', colors: ['#e63946', '#d62828', '#ff5a5f', '#b8232f'], size: [5, 10], vy: [.6, 1.4], sway: [1, 2.4], alpha: [.6, .95] },
  green: { label: 'Весна · зелёные листики', shape: 'leaf', colors: ['#8fd6a4', '#6fd6b1', '#a8e6b0', '#57c489'], size: [4.5, 9], vy: [.5, 1.2], sway: [.8, 2], alpha: [.55, .9] },
  fireflies: { label: 'Лето · светлячки', shape: 'glow', colors: ['#ffe28a', '#c3ff8a', '#9affc3', '#ffd76e'], size: [2, 4.5], vy: [-.15, .35], sway: [.5, 1.5], alpha: [.35, .9], twinkle: true, glow: true },
  stars: { label: 'Ночь · звёздочки', shape: 'star', colors: ['#ffffff', '#ffd76e', '#cfe8ff', '#ffe9b0'], size: [1.5, 3.5], vy: [.05, .25], sway: [.2, .8], alpha: [.3, .9], twinkle: true },
  gold: { label: 'Золотая пыль', shape: 'glow', colors: ['#ffd76e', '#ffbe5c', '#ffe9a0'], size: [1.5, 3.5], vy: [.3, .9], sway: [.4, 1.4], alpha: [.3, .8], twinkle: true, glow: true },
  rain: { label: 'Дождь', shape: 'drop', colors: ['#9fd0ff', '#7ab8ff', '#c4e2ff'], size: [2, 3.5], vy: [3, 5], sway: [.05, .2], alpha: [.35, .7] }
};

/* ---- породы деревьев (13) ---- */
const TREE_STYLES = {
  sakura: { label: 'Сакура цветущая', shape: 'broad', trunk: ['#3a2531', '#6b4a55'], bark: '#2a1a24', leaf: ['#7e2f52', '#c94f7c', '#ffd9e6'], blooms: ['#ffdce8', '#ffcad9', '#ffb6cf', '#ffa5c6', '#fdeef5'], bloomRate: .75 },
  night: { label: 'Ночная сакура', shape: 'broad', trunk: ['#221831', '#3d2c49'], bark: '#181022', leaf: ['#241b2e', '#4a2a56', '#6e3b6e'], blooms: ['#ff7aa2', '#ff9dc4', '#b18cff', '#ffcad9'], bloomRate: .8, glow: '#ff7aa2' },
  maple: { label: 'Клён осенний', shape: 'broad', trunk: ['#4d3226', '#7a5240'], bark: '#33201a', leaf: ['#8c2f1d', '#d95a2b', '#ffb347'] },
  oak: { label: 'Летний дуб', shape: 'broad', trunk: ['#463225', '#6e5138'], bark: '#2e2015', leaf: ['#2c5d31', '#4e8f4a', '#9ed67f'] },
  pine: { label: 'Хвойная ель', shape: 'pine', trunk: ['#4a3428', '#6e4e38'], bark: '#312116', leaf: ['#173a2a', '#2b5e40', '#4f8f63'] },
  firsnow: { label: 'Заснеженная ель', shape: 'pine', trunk: ['#3f3242', '#5d4a5e'], bark: '#2a2130', leaf: ['#274156', '#3f6d84', '#9fc8d8'], snowCap: true },
  willow: { label: 'Плакучая ива', shape: 'willow', trunk: ['#4b3a2e', '#705a44'], bark: '#32261c', leaf: ['#4a6b2f', '#7fae4e', '#c8e39a'] },
  birch: { label: 'Берёза', shape: 'birch', trunk: ['#c9cdd4', '#f4f6f8'], bark: '#8b93a0', birchMarks: true, leaf: ['#5f8f3e', '#94c162', '#e3f0a8'] },
  magnolia: { label: 'Магнолия', shape: 'bare', trunk: ['#4b3341', '#6b4d55'], bark: '#2e1f28', leaf: null, blooms: ['#fff6ea', '#fdeedc', '#f7e3c8', '#ffffff'], bigBloom: true },
  orange: { label: 'Апельсиновое дерево', shape: 'broad', trunk: ['#4a3527', '#6e5138'], bark: '#312116', leaf: ['#2f5d33', '#57a055', '#a8d98a'], fruit: ['#ff9a3d', '#ffb54d'], fruitRate: .5 },
  winter: { label: 'Зимнее дерево', shape: 'bare', trunk: ['#3a2d3f', '#5d4a5e'], bark: '#281f2e', leaf: null, snow: true },
  bonsai: { label: 'Бонсай', shape: 'bonsai', trunk: ['#5d4433', '#8a6850'], bark: '#3e2c20', leaf: ['#2f5d3a', '#4f8f55', '#9fd98a'] },
  apple: { label: 'Яблоня в цвету', shape: 'broad', trunk: ['#4b3341', '#6b4d55'], bark: '#2e1f28', leaf: ['#3f6b35', '#6fa855', '#c3e59a'], blooms: ['#fff5f8', '#ffd6e3', '#ffeef4'], bloomRate: .55 }
};

/* ================= утилиты ================= */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const pad2 = n => String(n).padStart(2, '0');
const fmtInt = n => Math.round(n).toLocaleString('ru-RU');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDur = min => { const h = Math.floor(min / 60), m = Math.round(min % 60); if (!h) return m + ' мин'; return m ? `${fmtInt(h)} ч ${m} мин` : `${fmtInt(h)} ч`; };
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return (h >= 11 && h <= 14) ? c : (m === 1 ? a : (m >= 2 && m <= 4 ? b : c)); };
const findTitle = id => state.titles.find(t => t.id === id);
const mulberry32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

function shadeColor(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function lighten(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const mix = v => Math.round(v + (255 - v) * f);
  return '#' + ((1 << 24) + (mix((n >> 16) & 255) << 16) + (mix((n >> 8) & 255) << 8) + mix(n & 255)).toString(16).slice(1);
}

/* сжатие картинки в компактный dataURL (webp→jpeg) */
function compressImage(file, maxW, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let d = c.toDataURL('image/webp', quality);
      if (!d.startsWith('data:image/webp')) d = c.toDataURL('image/jpeg', quality);
      resolve(d);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

/* ================= хранилище ================= */
const LS_KEY = 'anime.v3', LS_SET = 'anime.settings', LS_BG = 'anime.bg', LS_SYNC = 'anime.sync';
const OLD_KEYS = ['anime.v2', 'tsundoku.v1'];
const DEFAULT_SETTINGS = {
  anim: true, tempo: 'normal', rowAnim: true, cascade: true, modalPop: true, toastAnim: true, pillGlow: true,
  emblemAnim: 'full', embAnimSpeed: 6, tierGlow: true, tierBg: true,
  tilt: true, tiltPower: 8, cardLift: true, glow: true, shine: true,
  counters: true, counterSpeed: 800, recent: true,
  light: false, panelOp: 88, radius: 11, accent: 'sakura',
  catalogView: 'posters',
  particles: true, particleStyle: 'sakura', petalDensity: 45, fallSpeed: 100,
  particleSize: 100, particleOpacity: 100, particleSpin: true, twinkle: true, wind: 100, petsFront: false,
  branches: true, branchStyle: 'sakura', sway: true, parallax: 30, branchAlpha: 95,
  ambient: true, moon: true, bgDim: 55,
  epMin: 24, filmMin: 110
};

function normDate(d) { return (d && +d.y) ? { d: +d.d || null, m: +d.m || null, y: +d.y } : null; }

function unitName(t, u, i) {
  if (u.name) return u.name;
  const us = t.units || [];
  if (t.type === 'tv') {
    const same = us.filter(x => x.kind === u.kind).length;
    if (same <= 1) return KIND[u.kind].label;
    const n = us.filter((x, j) => x.kind === u.kind && j <= i).length;
    return KIND[u.kind].label + ' ' + n;
  }
  return us.length > 1 ? KIND[u.kind].label + ' ' + (i + 1) : KIND[u.kind].label;
}

function normalizeTitle(t) {
  const type = ['tv', 'film', 'ova', 'ona'].includes(t.type) ? t.type : 'tv';
  let units;
  if (Array.isArray(t.units) && t.units.length) {
    let seasonN = 0, filmN = 0;
    units = t.units.map(u => {
      const kind = KIND_ORDER.includes(u.kind) ? u.kind : (type === 'tv' ? 'season' : type);
      let name = typeof u.name === 'string' ? u.name.trim() : '';
      if (!name && t.type === 'tv') {
        if (kind === 'season') { seasonN++; name = 'Сезон ' + seasonN; }
        else if (kind === 'film') { filmN++; name = filmN > 1 ? 'Фильм ' + filmN : 'Фильм'; }
        else name = KIND[kind].label;
      }
      return { kind, name, episodes: Math.max(0, +u.episodes || 0), minutes: +u.minutes > 0 ? +u.minutes : null, date: normDate(u.date) };
    });
  } else if (type === 'tv') {
    units = [];
    if (Array.isArray(t.seasons)) {
      t.seasons.forEach((s, i) => units.push({ kind: 'season', name: 'Сезон ' + (i + 1), episodes: Math.max(0, +s.episodes || 0), minutes: null, date: normDate(s.date) }));
    } else if (+t.seasons > 0) {
      const n = +t.seasons, total = Math.max(0, +t.episodes || 0);
      const per = Math.floor(total / n), rest = total - per * n;
      for (let i = 0; i < n; i++) units.push({ kind: 'season', name: 'Сезон ' + (i + 1), episodes: per + (i === n - 1 ? rest : 0), minutes: null, date: i === 0 ? normDate(t.date) : null });
    }
    if (+t.relatedFilms > 0) for (let i = 0; i < +t.relatedFilms; i++) units.push({ kind: 'film', name: '', episodes: 0, minutes: null, date: null });
    if (+t.extraEps > 0) units.push({ kind: 'ova', name: '', episodes: +t.extraEps, minutes: null, date: null });
  } else if (type === 'film') {
    units = [{ kind: 'film', name: '', episodes: 0, minutes: +t.minutes > 0 ? +t.minutes : null, date: normDate(t.date) }];
  } else {
    units = [{ kind: type, name: '', episodes: Math.max(0, +t.episodes || 0), minutes: null, date: normDate(t.date) }];
  }
  let date = normDate(t.date);
  if (units.length) {
    const last = [...units].reverse().find(u => u.date);
    if (last) date = last.date;
  }
  return {
    id: t.id || uid(), createdAt: +t.createdAt || Date.now(),
    name: String(t.name || 'Без названия'), cover: String(t.cover || ''),
    tier: TIERS.includes(t.tier) ? t.tier : 'C', type,
    genres: Array.isArray(t.genres) ? t.genres.map(String).slice(0, 25) : [],
    units,
    episodes: (type === 'ova' || type === 'ona') ? units.reduce((s, u) => s + (u.kind !== 'film' ? u.episodes : 0), 0) : 0,
    date, minutes: +t.minutes > 0 ? +t.minutes : null, notes: String(t.notes || '')
  };
}

function loadTitles() {
  for (const key of [LS_KEY, ...OLD_KEYS]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.titles)) return { titles: d.titles.map(normalizeTitle), updatedAt: +d.updatedAt || 0 };
      }
    } catch (e) {}
  }
  return { titles: [], updatedAt: 0 };
}

function loadSettings() {
  let s = null;
  try { const raw = localStorage.getItem(LS_SET); if (raw) s = JSON.parse(raw); } catch (e) {}
  if (!s) {
    try { const old = JSON.parse(localStorage.getItem(LS_KEY)); if (old && old.settings) s = old.settings; } catch (e) {}
  }
  const out = Object.assign({}, DEFAULT_SETTINGS, s || {});
  if (s) {
    if (s.tierWobble === false) out.emblemAnim = 'off';
    if (s.tierWobbleSpeed != null && s.embAnimSpeed == null) out.embAnimSpeed = s.tierWobbleSpeed;
    if (s.sssGlow != null) out.tierGlow = s.sssGlow;
    delete out.tierWobble; delete out.tierWobbleSpeed; delete out.sssGlow;
    delete out.grain; delete out.grainOp;
  }
  return out;
}

let state = loadTitles();
let settings = loadSettings();
let sortMode = 'added';
let quotaWarned = false;

function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ v: 3, updatedAt: state.updatedAt, titles: state.titles }));
  } catch (e) {
    try {
      const light = state.titles.map(t => (t.cover && t.cover.startsWith('data:')) ? { ...t, cover: '' } : t);
      localStorage.setItem(LS_KEY, JSON.stringify({ v: 3, updatedAt: 0, titles: light }));
      if (!quotaWarned) {
        quotaWarned = true;
        toast('Локальный кэш переполнен — обложки временно выгружены из кэша. Полная версия хранится в GitHub.', 'warn');
      }
    } catch (e2) {}
  }
}

function persistSettings() {
  try { localStorage.setItem(LS_SET, JSON.stringify(settings)); } catch (e) {}
}

function save(push = true) {
  state.updatedAt = Date.now();
  persist();
  broadcastLocal();
  if (push && typeof schedulePush === 'function') schedulePush();
}

let bc = null;
try { bc = new BroadcastChannel('anime-catalog'); } catch (e) {}
function broadcastLocal() { try { bc && bc.postMessage({ updatedAt: state.updatedAt }); } catch (e) {} }
function applyLocalRemote() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY));
    if (d && (d.updatedAt || 0) > (state.updatedAt || 0)) {
      state.titles = (d.titles || []).map(normalizeTitle);
      state.updatedAt = d.updatedAt;
      renderAll();
    }
  } catch (e) {}
}
if (bc) bc.onmessage = e => { if (e.data && e.data.updatedAt > (state.updatedAt || 0)) applyLocalRemote(); };
window.addEventListener('storage', e => { if (e.key === LS_KEY && e.newValue) applyLocalRemote(); });

/* ================= расчёты ================= */
function titleEpisodes(t) {
  if (t.units && t.units.length) return t.units.reduce((s, u) => u.kind !== 'film' ? s + (+u.episodes || 0) : s, 0);
  if (t.type === 'film') return 0;
  return +t.episodes || 0;
}
function titleFilms(t) {
  if (t.units && t.units.length) return t.units.filter(u => u.kind === 'film').length;
  return t.type === 'film' ? 1 : 0;
}
function epMinutes(t) { return +t.minutes > 0 ? +t.minutes : settings.epMin; }
function filmMinutes(t) { return (t.type === 'film' && +t.minutes > 0) ? +t.minutes : settings.filmMin; }
function titleMinutes(t) {
  if (t.units && t.units.length) {
    let m = 0;
    for (const u of t.units) {
      if (u.kind === 'film') m += (u.minutes > 0 ? u.minutes : settings.filmMin);
      else m += (+u.episodes || 0) * epMinutes(t);
    }
    return m;
  }
  if (t.type === 'film') return filmMinutes(t);
  return titleEpisodes(t) * epMinutes(t);
}
function tvSummary(t) {
  const u = t.units || []; const parts = [];
  const s = u.filter(x => x.kind === 'season').length;
  if (s) parts.push(s + ' ' + plural(s, 'сезон', 'сезона', 'сезонов'));
  const f = u.filter(x => x.kind === 'film').length;
  if (f) parts.push(f + ' ' + plural(f, 'фильм', 'фильма', 'фильмов'));
  const sp = u.filter(x => x.kind === 'special').length;
  if (sp) parts.push(sp + ' спешл');
  const ov = u.filter(x => x.kind === 'ova').length;
  if (ov) parts.push(ov + ' OVA');
  const on = u.filter(x => x.kind === 'ona').length;
  if (on) parts.push(on + ' ONA');
  return parts.join(' · ');
}
function totals() {
  let eps = 0, films = 0, sMin = 0, fMin = 0;
  for (const t of state.titles) {
    eps += titleEpisodes(t); films += titleFilms(t);
    if (t.units && t.units.length) {
      for (const u of t.units) {
        if (u.kind === 'film') fMin += (u.minutes > 0 ? u.minutes : settings.filmMin);
        else sMin += (+u.episodes || 0) * epMinutes(t);
      }
    } else if (t.type === 'film') { fMin += filmMinutes(t); }
    else { sMin += titleEpisodes(t) * epMinutes(t); }
  }
  return { n: state.titles.length, eps, films, sMin, fMin, hours: (sMin + fMin) / 60 };
}

/* ================= даты ================= */
function parseDate(s) {
  if (!s || !s.trim()) return null;
  s = s.trim().replace(/\s+/g, '');
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) { const d = +m[1], mo = +m[2], y = +m[3]; if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return { err: true }; return { d, m: mo, y }; }
  m = s.match(/^(\d{1,2})\.(\d{4})$/);
  if (m) { const mo = +m[1], y = +m[2]; if (y < 1900 || y > 2100 || mo < 1 || mo > 12) return { err: true }; return { m: mo, y }; }
  m = s.match(/^(\d{4})$/);
  if (m) { const y = +m[1]; if (y < 1900 || y > 2100) return { err: true }; return { y }; }
  return { err: true };
}
function fmtDate(d) {
  if (!d) return '—';
  if (d.d != null) return `${pad2(d.d)}.${pad2(d.m)}.${d.y}`;
  if (d.m != null) return `${pad2(d.m)}.${d.y}`;
  return String(d.y);
}
const dateKey = d => d ? d.y * 10000 + (d.m || 1) * 100 + (d.d || 1) : -1;

/* ================= обложки ================= */
function coverSrc(t) {
  if (t.cover) return t.cover;
  const letter = (t.name || '?').trim().charAt(0).toUpperCase().replace(/[<>&]/g, '');
  const c = TIER_COLOR[t.tier] || '#9b93a6';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#1a1424"/><rect x="16" y="16" width="368" height="568" fill="none" stroke="${c}" stroke-opacity=".5" stroke-width="2"/><text x="200" y="345" font-family="Georgia,'Times New Roman',serif" font-size="190" fill="${c}" fill-opacity=".9" text-anchor="middle">${letter}</text><text x="200" y="540" font-family="monospace" font-size="20" fill="${c}" fill-opacity=".5" text-anchor="middle" letter-spacing="8">ANIME</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
document.addEventListener('error', e => {
  const img = e.target;
  if (img && img.tagName === 'IMG' && img.dataset.fb && !img.dataset.done) {
    img.dataset.done = '1';
    const t = findTitle(img.dataset.fb);
    if (t) img.src = coverSrc(t);
  }
}, true);

/* ================================================================
   ГЕНЕРАТИВНЫЕ ДЕРЕВЬЯ
   ================================================================ */
function generateTree(seed, sk, W, H, mirror) {
  const S = TREE_STYLES[sk] || TREE_STYLES.sakura;
  const R = mulberry32(seed);
  const rnd = (a, b) => a + R() * (b - a);
  const dir = mirror ? -1 : 1;
  const id = 't' + seed;
  const L = S.leaf;
  const root = { x: mirror ? 60 : W - 60, y: H + 46 };
  const top = { x: (mirror ? 60 : W - 60) + dir * W * rnd(.16, .28), y: H * rnd(.28, .38) };
  const c1 = { x: root.x + dir * W * .04, y: root.y - (root.y - top.y) * .28 };
  const c2 = { x: top.x - dir * W * rnd(.05, .12), y: top.y + (root.y - top.y) * .22 };
  const cub = t => { const u = 1 - t; return { x: u * u * u * root.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * top.x, y: u * u * u * root.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * top.y }; };
  const w0 = rnd(24, 32), w1 = rnd(6, 9);
  const N = 9;
  let leftP = [], rightP = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, p = cub(t), w = (w0 + (w1 - w0) * t) / 2;
    leftP.push({ x: p.x - w + rnd(-1.6, 1.6), y: p.y });
    rightP.push({ x: p.x + w + rnd(-1.6, 1.6), y: p.y });
  }
  const trunkD = 'M' + leftP.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' L') + ' L' + rightP.slice().reverse().map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' L') + ' Z';
  let bark = '';
  for (let i = 0; i < 7; i++) {
    const t = rnd(.12, .92), p = cub(t), h = rnd(13, 40);
    bark += `<path d="M${(p.x + rnd(-4, 4)).toFixed(1)},${(p.y - h / 2).toFixed(1)} q${rnd(-3, 3).toFixed(1)},${(h / 2).toFixed(1)} ${rnd(-2, 2).toFixed(1)},${h.toFixed(1)}" fill="none" stroke="${S.bark}" stroke-width="${rnd(.7, 1.5).toFixed(1)}" stroke-linecap="round" opacity=".55"/>`;
  }
  let marks = '';
  if (S.birchMarks) {
    for (let i = 0; i < 9; i++) {
      const t = rnd(.08, .95), p = cub(t);
      marks += `<rect x="${(p.x - rnd(1, 5)).toFixed(1)}" y="${p.y.toFixed(1)}" width="${rnd(4, 13).toFixed(1)}" height="${rnd(1.6, 3).toFixed(1)}" rx="1" fill="#39404c" opacity="${rnd(.45, .8).toFixed(2)}"/>`;
    }
  }
  let bSvg = '';
  const tips = [];
  const quad = (p, c, e, t) => { const u = 1 - t; return { x: u * u * p.x + 2 * u * t * c.x + t * t * e.x, y: u * u * p.y + 2 * u * t * c.y + t * t * e.y }; };
  function branch(x, y, ang, len, w, depth) {
    const na = ang + rnd(-.2, .2);
    const ex = x + Math.cos(na) * len, ey = y + Math.sin(na) * len;
    const mx = x + Math.cos(na) * len * .5 + rnd(-10, 10), my = y + Math.sin(na) * len * .5 + rnd(-10, 10);
    const d = `M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
    bSvg += `<path d="${d}" fill="none" stroke="url(#wd${id})" stroke-width="${w.toFixed(1)}" stroke-linecap="round"/>`;
    if (S.snow) bSvg += `<path d="${d}" fill="none" stroke="#eef4ff" stroke-width="${Math.max(1.3, w * .5).toFixed(1)}" stroke-linecap="round" opacity=".8" transform="translate(0,-${(w * .26).toFixed(1)})"/>`;
    if (depth <= 1) { tips.push({ x: ex, y: ey }); return; }
    const n = (depth >= 4 && R() < .45) ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const sp = rnd(.4, .75) * (i === 0 ? 1 : -1);
      branch(ex, ey, na + sp, len * rnd(.6, .76), Math.max(1.5, w * .6), depth - 1);
    }
  }
  let crown = '';
  const crownOrigin = { x: (root.x + top.x) / 2, y: top.y + 40 };
  function cluster(c, dotsN, rMin, rMax) {
    let g = '';
    if (S.glow) g += `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${(c.r * 1.7).toFixed(1)}" fill="url(#hl${id})"/>`;
    for (let i = 0; i < dotsN; i++) {
      const a = R() * 6.28, d = R() * c.r * .9;
      const rr = c.r * rnd(rMin, rMax);
      const kind = R();
      const fill = kind < .35 ? `url(#lg${id})` : kind < .7 ? `url(#mg${id})` : `url(#dg${id})`;
      g += `<circle cx="${(c.x + Math.cos(a) * d).toFixed(1)}" cy="${(c.y + Math.sin(a) * d * .8).toFixed(1)}" r="${rr.toFixed(1)}" fill="${fill}"/>`;
    }
    if (S.blooms && R() < (S.bloomRate != null ? S.bloomRate : .6)) {
      const k = 3 + Math.floor(R() * 4);
      for (let i = 0; i < k; i++) {
        const a = R() * 6.28, d = R() * c.r * .85;
        g += `<g transform="translate(${(c.x + Math.cos(a) * d).toFixed(1)},${(c.y + Math.sin(a) * d * .7).toFixed(1)}) rotate(${(R() * 360).toFixed(0)}) scale(${rnd(.45, .8).toFixed(2)})"><use href="#f5${id}" fill="${S.blooms[Math.floor(R() * S.blooms.length)]}"/></g>`;
      }
    }
    if (S.fruit && R() < (S.fruitRate || .5)) {
      const k = 2 + Math.floor(R() * 3);
      for (let i = 0; i < k; i++) {
        const a = R() * 6.28, d = R() * c.r * .8;
        const fx = c.x + Math.cos(a) * d, fy = c.y + Math.sin(a) * d * .7;
        g += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${rnd(3, 4.4).toFixed(1)}" fill="${S.fruit[Math.floor(R() * S.fruit.length)]}"/><circle cx="${(fx - 1).toFixed(1)}" cy="${(fy - 1.2).toFixed(1)}" r="1" fill="#fff" opacity=".55"/>`;
      }
    }
    return g;
  }
  if (S.shape === 'pine') {
    const tiers = 5 + Math.floor(R() * 2);
    for (let i = 0; i < tiers; i++) {
      const f = i / (tiers - 1);
      const y = (H - 70) - (H - 70 - (top.y + 50)) * f;
      const x = root.x + (top.x - root.x) * f;
      const wi = W * (0.34 - 0.24 * f);
      const h = rnd(55, 85) * (1 - f * .3);
      const wave = (sign, k) => `Q${(x + sign * wi * (k + .14)).toFixed(1)},${(y - h * .22).toFixed(1)} ${(x + sign * wi * (k + .3)).toFixed(1)},${y.toFixed(1)}`;
      const d = `M${(x - wi).toFixed(1)},${y.toFixed(1)} Q${(x - wi * .45).toFixed(1)},${(y - h * .95).toFixed(1)} ${x.toFixed(1)},${(y - h).toFixed(1)} Q${(x + wi * .45).toFixed(1)},${(y - h * .95).toFixed(1)} ${(x + wi).toFixed(1)},${y.toFixed(1)} ${wave(-1, -.28)} ${wave(-1, -.02)} Q${x.toFixed(1)},${(y - h * .18).toFixed(1)} ${wave(1, .02)} ${wave(1, .28)} Z`;
      crown += `<path d="${d}" fill="url(#dg${id})"/>`;
      crown += `<path d="${d}" fill="url(#lg${id})" transform="translate(0,-6) scale(.82)" style="transform-origin:${x.toFixed(0)}px ${y.toFixed(0)}px" opacity=".85"/>`;
      if (S.snowCap) {
        crown += `<ellipse cx="${(x - wi * .75).toFixed(1)}" cy="${(y - 3).toFixed(1)}" rx="${(wi * .22).toFixed(1)}" ry="5" fill="#f4f8ff" opacity=".9"/>`;
        crown += `<ellipse cx="${(x + wi * .75).toFixed(1)}" cy="${(y - 3).toFixed(1)}" rx="${(wi * .22).toFixed(1)}" ry="5" fill="#f4f8ff" opacity=".9"/>`;
      }
    }
    crown += `<ellipse cx="${top.x.toFixed(1)}" cy="${(top.y + 40).toFixed(1)}" rx="16" ry="22" fill="url(#dg${id})"/>`;
  } else if (S.shape === 'willow') {
    const nb2 = 5 + Math.floor(R() * 3);
    for (let i = 0; i < nb2; i++) {
      const t = rnd(.45, .9), p = cub(t);
      branch(p.x, p.y, -Math.PI / 2 + (i - (nb2 - 1) / 2) * rnd(.35, .6), rnd(55, 90), rnd(4, 7), 3);
    }
    for (const tp of tips) {
      const strands = 2 + Math.floor(R() * 2);
      for (let s = 0; s < strands; s++) {
        const ex = tp.x + rnd(-16, 16), ey = tp.y;
        const len = rnd(130, 220);
        const e = { x: ex + rnd(-55, 55), y: ey + len };
        const c = { x: ex + rnd(-25, 25), y: ey + len * .55 };
        for (let j = 2; j <= 11; j++) {
          const q = quad({ x: ex, y: ey }, c, e, j / 11);
          const ang = Math.atan2(e.y - ey, e.x - ex);
          crown += `<ellipse cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" rx="2.2" ry="${rnd(4, 6.5).toFixed(1)}" fill="url(#${R() < .4 ? 'lg' : 'dg'}${id})" transform="rotate(${(ang * 57.3 + 90).toFixed(0)} ${q.x.toFixed(1)} ${q.y.toFixed(1)})"/>`;
        }
      }
    }
  } else if (S.shape === 'bonsai') {
    bSvg = '';
    const m1 = { x: root.x + dir * W * rnd(.05, .12), y: H * rnd(.55, .65) };
    const m2 = { x: root.x + dir * W * rnd(.18, .3), y: H * rnd(.4, .5) };
    const segs = [[root, m1], [m1, m2], [m2, top]];
    let bl = [], br = [];
    for (let si = 0; si < segs.length; si++) {
      const [a, b] = segs[si];
      const wA = (w0 * (1 - si / 3) + w1 * (si / 3)) / 2;
      for (let j = 0; j <= 3; j++) {
        const t = j / 3, u = 1 - t;
        const p = { x: u * u * a.x + 2 * u * t * ((a.x + b.x) / 2 + dir * rnd(-10, 10)) + t * t * b.x, y: u * u * a.y + 2 * u * t * ((a.y + b.y) / 2 + rnd(-8, 8)) + t * t * b.y };
        const w = wA * (1 - t * .5);
        bl.push({ x: p.x - w, y: p.y }); br.push({ x: p.x + w, y: p.y });
      }
    }
    const trunkD2 = 'M' + bl.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' L') + ' L' + br.slice().reverse().map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' L') + ' Z';
    bSvg += `<path d="${trunkD2}" fill="url(#tk${id})"/>` + bark;
    const pads = 4 + Math.floor(R() * 2);
    for (let i = 0; i < pads; i++) {
      const t = rnd(.3, .95), p = cub(t);
      const ang = dir > 0 ? rnd(-.5, .25) : Math.PI - rnd(-.5, .25);
      const len = rnd(70, 120);
      const ex = p.x + Math.cos(ang) * len * dir, ey = p.y + Math.sin(ang) * len * .4 - rnd(10, 40);
      bSvg += `<path d="M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${((p.x + ex) / 2).toFixed(1)},${(p.y - rnd(6, 20)).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="url(#wd${id})" stroke-width="${rnd(4, 7).toFixed(1)}" stroke-linecap="round"/>`;
      crown += cluster({ x: ex, y: ey, r: rnd(26, 36) }, 11, .5, 1);
    }
    crown += cluster({ x: top.x, y: top.y, r: rnd(30, 40) }, 12, .5, 1);
    crown += `<path d="M${(root.x - dir * 10).toFixed(1)},${(H - 14).toFixed(1)} l${(-dir * 26).toFixed(1)},${(-rnd(10, 18)).toFixed(1)} l${(-dir * 20).toFixed(1)},${rnd(6, 12).toFixed(1)} Z" fill="#4a4550" opacity=".85"/>` + `<ellipse cx="${(root.x - dir * 55).toFixed(1)}" cy="${(H - 18).toFixed(1)}" rx="18" ry="8" fill="#565064" opacity=".7"/>`;
  } else {
    const nb2 = 4 + Math.floor(R() * 3);
    for (let i = 0; i < nb2; i++) {
      const t = rnd(.42, .92), p = cub(t);
      const side = R() < .5 ? 1 : -1;
      branch(p.x, p.y, -Math.PI / 2 + side * rnd(.5, 1.05), rnd(60, 110) * (1 - t * .35), rnd(5, 9), S.shape === 'bare' ? 5 : 4);
    }
    if (L) {
      const clusters = tips.map(tp => ({ x: tp.x + rnd(-8, 8), y: tp.y + rnd(-6, 6), r: rnd(16, 26) }));
      for (let i = 0; i < 4; i++) {
        const t = rnd(.55, .9), p = cub(t);
        clusters.push({ x: p.x + rnd(-20, 20), y: p.y - rnd(10, 44), r: rnd(24, 34) });
      }
      const dotsN = S.shape === 'birch' ? 5 : 7;
      const rMin = S.shape === 'birch' ? .45 : .55;
      for (const c of clusters) crown += cluster(c, dotsN, rMin, S.shape === 'birch' ? .9 : 1.05);
    }
    if (S.shape === 'bare' && S.bigBloom) {
      for (const tp of tips) {
        const k = 1 + Math.floor(R() * 2);
        for (let i = 0; i < k; i++) {
          crown += `<g transform="translate(${(tp.x + rnd(-6, 6)).toFixed(1)},${(tp.y + rnd(-6, 6)).toFixed(1)}) rotate(${(R() * 360).toFixed(0)}) scale(${rnd(1.05, 1.6).toFixed(2)})"><use href="#f6${id}" fill="${S.blooms[Math.floor(R() * S.blooms.length)]}"/></g>`;
        }
        if (R() < .6) {
          crown += `<g transform="translate(${(tp.x + rnd(-14, 14)).toFixed(1)},${(tp.y + rnd(-10, 10)).toFixed(1)}) rotate(${(R() * 70 - 35).toFixed(0)})"><ellipse rx="2.3" ry="3.6" fill="#e8c9a0"/><ellipse cx="1" cy="-1.3" rx="1" ry="1.7" fill="#fff" opacity=".4"/></g>`;
        }
      }
    }
    if (S.shape === 'bare' && S.snow) {
      for (const tp of tips) {
        crown += `<circle cx="${tp.x.toFixed(1)}" cy="${(tp.y - 1).toFixed(1)}" r="${rnd(2.6, 4.2).toFixed(1)}" fill="#f4f8ff" opacity=".9"/>`;
      }
    }
  }
  const petal5 = 'M0 3 C 4.8 1, 5.6 -4.2, 1.8 -7.8 L 0 -6.2 L -1.8 -7.8 C -5.6 -4.2, -4.8 1, 0 3 Z';
  const petal6 = 'M0 3.4 C 5.4 1.6, 6.2 -4.6, 2 -8.4 L 0 -6.6 L -2 -8.4 C -6.2 -4.6, -5.4 1.6, 0 3.4 Z';
  const flower = n => [...Array(n).keys()].map(i => `<path transform="rotate(${(360 / n * i).toFixed(0)})" d="${n === 6 ? petal6 : petal5}"/>`).join('') + '<circle r="1.6" fill="#ffd76e" opacity=".9"/>' + [0, 1, 2].map(i => `<circle cx="${(Math.cos(i * 2.09) * 3.4).toFixed(1)}" cy="${(Math.sin(i * 2.09) * 3.4).toFixed(1)}" r=".55" fill="#ffd76e" opacity=".8"/>`).join('');
  const defs = `
<defs>
<linearGradient id="tk${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${S.trunk[0]}"/><stop offset=".55" stop-color="${S.trunk[1]}"/><stop offset="1" stop-color="${S.trunk[0]}"/></linearGradient>
<linearGradient id="wd${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${S.trunk[0]}"/><stop offset="1" stop-color="${S.trunk[1]}"/></linearGradient>
${L ? `<radialGradient id="lg${id}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="${L[2]}"/><stop offset="1" stop-color="${L[1]}"/></radialGradient><radialGradient id="mg${id}" cx="45%" cy="40%" r="85%"><stop offset="0" stop-color="${L[1]}"/><stop offset="1" stop-color="${L[1]}"/></radialGradient><radialGradient id="dg${id}" cx="45%" cy="40%" r="85%"><stop offset="0" stop-color="${L[1]}"/><stop offset="1" stop-color="${L[0]}"/></radialGradient>` : `<radialGradient id="lg${id}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="${S.trunk[1]}"/><stop offset="1" stop-color="${S.trunk[0]}"/></radialGradient><radialGradient id="mg${id}" cx="45%" cy="40%" r="85%"><stop offset="0" stop-color="${S.trunk[1]}"/><stop offset="1" stop-color="${S.trunk[0]}"/></radialGradient><radialGradient id="dg${id}" cx="45%" cy="40%" r="85%"><stop offset="0" stop-color="${S.trunk[1]}"/><stop offset="1" stop-color="${S.trunk[0]}"/></radialGradient>`}
${S.glow ? `<radialGradient id="hl${id}"><stop offset="0" stop-color="${S.glow}" stop-opacity=".4"/><stop offset="1" stop-color="${S.glow}" stop-opacity="0"/></radialGradient>` : `<radialGradient id="hl${id}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`}
<symbol id="f5${id}" overflow="visible">${flower(5)}</symbol>
<symbol id="f6${id}" overflow="visible">${flower(6)}</symbol>
</defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="${mirror ? 'xMinYMax' : 'xMaxYMin'} meet">${defs}<g class="sway" style="transform-box:view-box;transform-origin:${root.x.toFixed(0)}px ${root.y.toFixed(0)}px">${S.shape === 'bonsai' ? bSvg : `<path d="${trunkD}" fill="url(#tk${id})"/>${bark}${marks}${bSvg}`}<g class="crown" style="transform-origin:${crownOrigin.x.toFixed(0)}px ${crownOrigin.y.toFixed(0)}px">${crown}</g></g></svg>`;
}

function renderTrees() {
  const style = TREE_STYLES[settings.branchStyle] ? settings.branchStyle : 'sakura';
  $('#branch-tr').innerHTML = generateTree(Math.floor(Math.random() * 1e6), style, 600, 800, false);
  $('#branch-bl').innerHTML = generateTree(Math.floor(Math.random() * 1e6), style, 460, 620, true);
}
renderTrees();

/* ================================================================
   3D-ЭМБЛЕМЫ
   ================================================================ */
function emblemShape(tier) {
  const c = TIER_COLOR[tier];
  const lt = lighten(c, .55);
  const dk = shadeColor(c, .42);
  const id = 'es' + tier;
  const defs = `<defs><linearGradient id="${id}" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${dk}"/></linearGradient><radialGradient id="${id}g" cx=".34" cy=".26" r=".95"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
  const petal = a => `<ellipse rx="10" ry="24" cy="-24" transform="rotate(${a})" fill="url(#${id})" stroke="${lt}" stroke-width="1.2" opacity=".95"/>`;
  const shapes = {
    SSS: `<polygon points="50,3 61.8,36.5 96,37.5 68.5,58.5 78.5,92.5 50,72 21.5,92.5 31.5,58.5 4,37.5 38.2,36.5" fill="url(#${id})" stroke="${lt}" stroke-width="1.6" stroke-linejoin="round"/><path d="M50 50 L50 3 M50 50 L96 37.5 M50 50 L78.5 92.5 M50 50 L21.5 92.5 M50 50 L4 37.5" stroke="rgba(60,40,0,.4)" stroke-width=".8"/><polygon points="50,3 61.8,36.5 38.2,36.5" fill="url(#${id}g)" opacity=".85"/>`,
    S: `<g transform="translate(50,52)">${[0, 60, 120, 180, 240, 300].map(petal).join('')}</g><circle cx="50" cy="52" r="16" fill="url(#${id})" stroke="${lt}" stroke-width="1.4"/><path d="M41 46 Q50 38 59 46" stroke="rgba(255,255,255,.55)" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    A: `<polygon points="50,4 83,40 50,96 17,40" fill="url(#${id})" stroke="${lt}" stroke-width="1.6" stroke-linejoin="round"/><path d="M17 40 H83 M50 4 L36 40 L50 96 M50 4 L64 40 L50 96" stroke="rgba(30,10,60,.38)" stroke-width=".9" fill="none"/><polygon points="50,4 64,40 50,40" fill="url(#${id}g)" opacity=".8"/>`,
    B: `<polygon points="50,3 77,25 77,75 50,97 23,75 23,25" fill="url(#${id})" stroke="${lt}" stroke-width="1.6" stroke-linejoin="round"/><path d="M50 3 V97 M23 25 L50 44 L77 25 M23 75 L50 56 L77 75" stroke="rgba(10,30,60,.35)" stroke-width=".9" fill="none"/><polygon points="50,3 77,25 50,44" fill="url(#${id}g)" opacity=".75"/>`,
    C: `<circle cx="50" cy="50" r="34" fill="none" stroke="url(#${id})" stroke-width="11"/><circle cx="50" cy="50" r="34" fill="none" stroke="${lt}" stroke-width="1" opacity=".7"/><circle cx="50" cy="50" r="19" fill="url(#${id})" stroke="${lt}" stroke-width="1.3"/><circle cx="50" cy="16" r="6" fill="${lt}" stroke="${dk}" stroke-width="1.4"/>`,
    D: `<path d="M50 4 L85 17 V52 C85 74 69 88 50 96 C31 88 15 74 15 52 V17 Z" fill="url(#${id})" stroke="${lt}" stroke-width="1.6" stroke-linejoin="round"/><path d="M50 4 L85 17 V52 H15 V17 Z" fill="url(#${id}g)" opacity=".4"/><path d="M50 22 L67 33 V54 C67 66 58 74 50 78 C42 74 33 66 33 54 V33 Z" fill="none" stroke="rgba(40,20,0,.35)" stroke-width="1.1"/>`,
    E: `<rect x="16" y="16" width="68" height="68" rx="14" fill="url(#${id})" stroke="${lt}" stroke-width="1.5"/><rect x="27" y="27" width="46" height="46" rx="9" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.3"/><path d="M23 33 Q50 21 77 33" stroke="rgba(255,255,255,.4)" stroke-width="1.7" fill="none" stroke-linecap="round"/>`
  };
  return `<svg viewBox="0 0 100 100">${defs}${shapes[tier]}</svg>`;
}

function emblemHTML(tier, i) {
  const layers = [{ z: -12, o: .22, b: .45 }, { z: -6, o: .55, b: .68 }, { z: 0, o: 1, b: 1 }, { z: 7, o: .4, b: 1.3 }]
    .map(L => `<div class="emb-layer" style="--z:${L.z}px;--lo:${L.o};--lb:${L.b}">${emblemShape(tier)}</div>`).join('');
  return `<div class="emb" data-tier="${tier}" style="--tc:${TIER_COLOR[tier]};--i:${i}"><span class="emb-aura"></span><span class="emb-ring"></span><div class="emb-rot">${layers}<span class="emb-letter">${tier}</span></div><span class="emb-shadow"></span>${tier === 'SSS' ? `<span class="emb-crown">${CROWN}</span>` : ''}</div>`;
}

/* ================= тосты / модалки ================= */
const PETAL_ICO = '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 C 15.5 6.5, 20 8.5, 20 13.5 C 20 18, 15.5 21, 12 22 C 8.5 21, 4 18, 4 13.5 C 4 8.5, 8.5 6.5, 12 2 Z"/></svg>';

function toast(msg, kind = 'ok') {
  const el = document.createElement('div');
  el.className = 'toast' + (kind === 'warn' ? ' warn' : '');
  el.innerHTML = (kind === 'warn'
    ? '<svg class="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16.5v.01"/></svg>'
    : PETAL_ICO) + `<span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, 3600);
}

const overlays = ['ov-title', 'ov-form', 'ov-day', 'ov-confirm', 'ov-login'];
const openOv = id => $('#'+id).classList.remove('hidden');
const closeOv = id => $('#'+id).classList.add('hidden');
const topOv = () => { for (let i = overlays.length - 1; i >= 0; i--) if (!$('#'+overlays[i]).classList.contains('hidden')) return overlays[i]; return null; };

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const sm = $('#sync-menu');
    if (sm && !sm.classList.contains('hidden')) { sm.classList.add('hidden'); return; }
    if (document.body.classList.contains('drawer-open')) { closeDrawer(); return; }
    const t = topOv(); if (t) closeOv(t);
  }
  if (e.key === '/' && !e.shiftKey && !e.target.closest('input,textarea,select') && !topOv()) { e.preventDefault(); switchView('tier'); $('#search-input')?.focus(); }
  if (e.key === '?' && !e.target.closest('input,textarea,select') && !topOv()) showHelp();
});
document.addEventListener('click', e => { if (e.target.closest('[data-close]')) { const ov = e.target.closest('.overlay'); if (ov) closeOv(ov.id); } });

function openConfirm({ title, text, okLabel = 'Подтвердить', danger = false, cancel = true, onOk }) {
  const m = $('#m-confirm');
  m.innerHTML = `<button class="modal-x" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><h2>${esc(title)}</h2><p>${text}</p><div class="form-foot">${cancel ? '<button class="btn" data-close>Отмена</button>' : ''}<button class="btn ${danger ? 'btn-danger' : 'btn-accent'}" id="cf-ok">${esc(okLabel)}</button></div>`;
  $('#cf-ok').onclick = () => { closeOv('ov-confirm'); onOk && onOk(); };
  openOv('ov-confirm');
}

function showHelp() {
  openConfirm({
    title: 'Горячие клавиши и приёмы',
    text: `· <b>/</b> — фокус на поиск<br>· <b>?</b> — эта подсказка<br>· <b>Esc</b> — закрыть окно или панель настроек<br>· клик по тиру в сводке сверху — переход к строке<br>· «Случайный тайтл» — рулетка из каталога`,
    okLabel: 'Понятно', cancel: false
  });
}

function animNum(el, target, dur) {
  dur = dur || settings.counterSpeed || 800;
  if (!settings.counters) { el.textContent = fmtInt(target); return; }
  const t0 = performance.now();
  (function s(now) { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmtInt(target * e); if (p < 1) requestAnimationFrame(s); })(t0);
}

/* ================= рендер ================= */
function renderAll() { renderHero(); renderRecent(); renderFilters(); renderTierlist(false); renderTimeline(); renderCalendar(); renderStats(); }

function renderHero() {
  const has = state.titles.length > 0;
  $('#hero').classList.toggle('hidden', !has);
  if (!has) return;
  const t = totals();
  $('#hero-stats').innerHTML = `<div class="hst"><b data-num="${t.n}">0</b><span>тайтлов</span><em>сериалы: ${state.titles.filter(x=>x.type==='tv').length}</em></div><div class="hst"><b data-num="${t.eps}">0</b><span>серий</span><em>вкл. спешлы, OVA/ONA</em></div><div class="hst"><b data-num="${t.films}">0</b><span>фильмов</span><em>отдельных, связанных и частей</em></div><div class="hst"><b data-num="${Math.round(t.hours)}">0</b><span>часов</span><em>≈ ${(t.hours/24).toLocaleString('ru-RU',{maximumFractionDigits:1})} суток</em></div>`;
  $$('#hero-stats b').forEach(el => animNum(el, +el.dataset.num));
}

function cardHTML(t, mini = false, ci = 0) {
  const eps = titleEpisodes(t);
  const films = titleFilms(t);
  const ns = t.type === 'tv' ? (t.units || []).filter(u => u.kind === 'season').length : 0;
  const first = t.type === 'film' ? (films > 1 ? films + ' ' + plural(films, 'фильм', 'фильма', 'фильмов') : 'фильм') : (eps ? eps + ' эп.' : 'фильм');
  return `<article class="card js-open ${mini ? 'mini' : ''}" data-id="${t.id}" style="--tc:${TIER_COLOR[t.tier]};--ci:${Math.min(ci, 14)}">${t.tier === 'SSS' ? `<span class="card-crown">${CROWN}</span>` : ''}<div class="cover"><img src="${esc(coverSrc(t))}" alt="${esc(t.name)}" loading="lazy" data-fb="${t.id}"><span class="type-tag">${TYPE_SHORT[t.type]}</span><span class="tier-badge">${t.tier}</span><div class="cover-meta"><div>${first}</div><div>${ns > 1 ? ns + ' сезона · ' : ''}${t.date ? fmtDate(t.date) : 'без даты'}</div></div></div><h3 class="card-title">${esc(t.name)}</h3></article>`;
}

function chipCardHTML(t) {
  const eps = titleEpisodes(t);
  return `<button type="button" class="chipcard js-open" data-id="${t.id}" style="--tc:${TIER_COLOR[t.tier]}"><img src="${esc(coverSrc(t))}" alt="" loading="lazy" data-fb="${t.id}"><span class="cc-body"><span class="cc-name">${t.tier === 'SSS' ? CROWN_MINI : ''}${esc(t.name)}</span><span class="cc-meta">${TYPE_SHORT[t.type]}${eps ? ' · ' + eps + ' эп.' : ''} · ${t.date ? fmtDate(t.date) : '—'}</span></span><span class="cc-tier">${t.tier}</span></button>`;
}

function listCardHTML(t) {
  const eps = titleEpisodes(t);
  const sum = t.type === 'tv' ? tvSummary(t) : (titleFilms(t) > 1 ? titleFilms(t) + ' ' + plural(titleFilms(t), 'фильм', 'фильма', 'фильмов') : '');
  return `<div class="listcard js-open" data-id="${t.id}" style="--tc:${TIER_COLOR[t.tier]}"><img src="${esc(coverSrc(t))}" alt="" loading="lazy" data-fb="${t.id}"><div class="lc-body"><div class="lc-name">${t.tier === 'SSS' ? CROWN_MINI : ''}${esc(t.name)}</div><div class="lc-sub">${TYPE_SHORT[t.type]}${sum ? ' · ' + sum : ''}${eps ? ' · ' + eps + ' эп.' : ''}</div></div><span class="lc-date">${t.date ? fmtDate(t.date) : '—'}</span><span class="lc-tier">${t.tier}</span></div>`;
}

function renderRecent() {
  const w = $('#recent-wrap');
  if (!settings.recent || !state.titles.length) { w.innerHTML = ''; return; }
  const recent = [...state.titles].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  w.innerHTML = `<div class="recent"><div class="recent-head"><h2>Недавно добавленные</h2><span>последние ${recent.length} из ${state.titles.length}</span></div><div class="recent-strip">${recent.map((t, i) => cardHTML(t, true, i)).join('')}</div></div>`;
}

/* ---- фильтры + жанры + сортировка ---- */
let filterQuery = '', filterGenres = new Set();
let gpOpen = false, gpMode = 'my', gpQuery = '';

function genreCounts() {
  const counts = new Map();
  state.titles.forEach(t => (t.genres || []).forEach(g => counts.set(g, (counts.get(g) || 0) + 1)));
  return counts;
}

function renderFilters() {
  const w = $('#filters-wrap');
  if (!state.titles.length) { w.innerHTML = ''; return; }
  const nSel = filterGenres.size;
  w.innerHTML = `<div class="filters"><div class="searchbox"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></svg><input id="search-input" name="anime-q-${uid()}" placeholder="Поиск по названию…" value="${esc(filterQuery)}" autocomplete="off" spellcheck="false"><button class="sb-clear ${filterQuery ? '' : 'hidden'}" id="sb-clear" title="Очистить поиск" aria-label="Очистить поиск"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><select class="sort-sel" id="sort-sel" title="Сортировка"><option value="added">По добавлению</option><option value="name">По названию</option><option value="date">По дате просмотра</option><option value="episodes">По сериям</option></select><button class="btn genre-toggle ${gpOpen ? 'on' : ''}" id="genre-toggle">${PETAL_ICO.replace('class="ic"', 'class="ic" width="15" height="15"')} Жанры${nSel ? ` <b>· ${nSel}</b>` : ''}</button>${nSel ? `<div class="active-genres">${[...filterGenres].map(g => `<button class="chip on" data-unselect="${esc(g)}">${esc(g)} ×</button>`).join('')}</div>` : ''}</div>${gpOpen ? `<div class="genre-panel" id="genre-panel"><div class="gp-top"><div class="gp-search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></svg><input id="gp-q" placeholder="Найти жанр…" value="${esc(gpQuery)}" autocomplete="off" spellcheck="false"></div><div class="gp-tabs"><button data-m="my" class="${gpMode === 'my' ? 'on' : ''}">В коллекции</button><button data-m="all" class="${gpMode === 'all' ? 'on' : ''}">Все жанры</button></div></div><div class="gp-grid" id="gp-grid"></div></div>` : ''}<div class="filters" style="margin-top:6px"><span class="filter-info" id="filter-info"></span></div>`;
  const inp = $('#search-input');
  inp.addEventListener('input', e => { filterQuery = e.target.value; $('#sb-clear').classList.toggle('hidden', !filterQuery); renderTierlist(false); });
  $('#sb-clear').addEventListener('click', () => { filterQuery = ''; renderFilters(); renderTierlist(false); $('#search-input')?.focus(); });
  const srt = $('#sort-sel');
  srt.value = sortMode;
  srt.addEventListener('change', e => { sortMode = e.target.value; renderTierlist(true); });
  $('#genre-toggle').addEventListener('click', () => { gpOpen = !gpOpen; renderFilters(); });
  const q = $('#gp-q');
  if (q) q.addEventListener('input', e => { gpQuery = e.target.value; renderGpGrid(); });
  $$('.gp-tabs button').forEach(b => b.addEventListener('click', () => { gpMode = b.dataset.m; renderFilters(); }));
  $$('[data-unselect]').forEach(b => b.addEventListener('click', () => { filterGenres.delete(b.dataset.unselect); renderFilters(); renderTierlist(false); }));
  if (gpOpen) renderGpGrid();
}

function renderGpGrid() {
  const grid = $('#gp-grid');
  if (!grid) return;
  const counts = genreCounts();
  let items;
  if (gpMode === 'my') items = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'));
  else items = [...new Set([...GENRES, ...counts.keys()])].sort((a, b) => a.localeCompare(b, 'ru')).map(g => [g, counts.get(g) || 0]);
  if (gpQuery) { const s = gpQuery.toLowerCase(); items = items.filter(([g]) => g.toLowerCase().includes(s)); }
  grid.innerHTML = items.length ? items.map(([g, n]) => `<button class="chip ${filterGenres.has(g) ? 'on' : ''}" data-gsel="${esc(g)}">${esc(g)}${n ? `<i>${n}</i>` : ''}</button>`).join('') : '<span class="gp-empty">Ничего не найдено</span>';
  $$('[data-gsel]').forEach(b => b.addEventListener('click', () => { const g = b.dataset.gsel; filterGenres.has(g) ? filterGenres.delete(g) : filterGenres.add(g); renderFilters(); renderTierlist(false); }));
}

document.addEventListener('click', e => {
  if (gpOpen && !e.target.closest('#genre-panel') && !e.target.closest('#genre-toggle')) { gpOpen = false; if ($('#filters-wrap').innerHTML) renderFilters(); }
});

function matchesFilters(t) {
  if (filterQuery && !t.name.toLowerCase().includes(filterQuery.trim().toLowerCase())) return false;
  if (filterGenres.size && ![...(t.genres || [])].some(g => filterGenres.has(g))) return false;
  return true;
}

function renderTierTotal(counts) {
  const bar = $('#tier-total');
  if (!state.titles.length) { bar.innerHTML = ''; return; }
  let html = `<button class="tt-item all" data-goto=""><span class="tt-b">Σ</span><span class="tt-n">${state.titles.length}</span><span class="tt-e">всего</span></button>`;
  TIERS.forEach(tier => { html += `<button class="tt-item" style="--tc:${TIER_COLOR[tier]}" data-goto="${tier}"><span class="tt-b">${tier}</span><span class="tt-n">${counts[tier]}</span><span class="tt-e">${TIER_EPITHET[tier].toLowerCase()}</span></button>`; });
  bar.innerHTML = html;
}

$('#tier-total').addEventListener('click', e => {
  const it = e.target.closest('.tt-item'); if (!it) return;
  if (it.dataset.goto) {
    const row = document.querySelector(`.tier-row[data-tier="${it.dataset.goto}"]`);
    if (row) row.scrollIntoView({ behavior: settings.anim && !REDUCED ? 'smooth' : 'auto', block: 'start' });
  } else window.scrollTo({ top: 0, behavior: 'smooth' });
});

const SORTS = {
  added: (a, b) => b.createdAt - a.createdAt,
  name: (a, b) => a.name.localeCompare(b.name, 'ru'),
  date: (a, b) => dateKey(b.date) - dateKey(a.date),
  episodes: (a, b) => titleEpisodes(b) - titleEpisodes(a)
};

function renderTierlist(animate) {
  const box = $('#tierlist');
  const hasData = state.titles.length > 0;
  $('#empty-state').style.display = hasData ? 'none' : '';
  if (!hasData) { box.innerHTML = ''; renderTierTotal({}); return; }
  box.classList.toggle('anim-in', !!animate);
  const view = settings.catalogView === 'chips' ? 'chips' : settings.catalogView === 'list' ? 'list' : 'posters';
  const renderCard = view === 'chips' ? chipCardHTML : view === 'list' ? listCardHTML : cardHTML;
  const counts = {}; TIERS.forEach(x => counts[x] = 0);
  state.titles.forEach(t => counts[t.tier]++);
  renderTierTotal(counts);
  const filtering = !!(filterQuery.trim() || filterGenres.size);
  let found = 0, html = '';
  TIERS.forEach((tier, i) => {
    const items = state.titles.filter(t => t.tier === tier && matchesFilters(t));
    found += items.length;
    if (filtering && !items.length) return;
    items.sort(SORTS[sortMode] || SORTS.added);
    html += `<div class="tier-row" data-tier="${tier}" style="--tc:${TIER_COLOR[tier]};--i:${i}"><div class="tier-side">${emblemHTML(tier, i)}<span class="tier-epithet">${TIER_EPITHET[tier]}</span><span class="tier-count"><b class="tc-n" data-n="${items.length}">${items.length}</b> ${plural(items.length, 'тайтл', 'тайтла', 'тайтлов')}</span></div><div class="tier-cards ${view !== 'posters' ? 'view-' + view : ''}">${items.map((t, ci) => renderCard(t, ci)).join('')}</div></div>`;
  });
  box.innerHTML = html || '<p class="tier-empty" style="padding:50px 0">Ничего не найдено — измените запрос или жанры</p>';
  if (animate) $$('#tierlist .tc-n').forEach(el => animNum(el, +el.dataset.n, Math.round((settings.counterSpeed || 800) * .7)));
  const info = $('#filter-info');
  if (info) info.textContent = filtering ? `найдено: ${found} · скрыто: ${state.titles.length - found}` : '';
}

function renderTimeline() {
  const box = $('#timeline');
  if (!state.titles.length) { box.innerHTML = '<p class="tier-empty" style="padding:40px 0">Список пуст</p>'; return; }
  const sorted = [...state.titles].sort((a, b) => dateKey(b.date) - dateKey(a.date) || b.createdAt - a.createdAt);
  let html = '', lastYear = null, idx = 0;
  for (const t of sorted) {
    const y = t.date ? t.date.y : null;
    if (y !== lastYear) {
      const inYear = sorted.filter(x => (x.date ? x.date.y : null) === y);
      html += `<div class="tl-year"><b>${y ?? 'Без даты'}</b><span>${inYear.length} ${plural(inYear.length, 'тайтл', 'тайтла', 'тайтлов')}</span></div>`;
      lastYear = y; idx = 0;
    }
    const eps = titleEpisodes(t), films = titleFilms(t);
    let sum = '';
    if (t.type === 'tv') sum = tvSummary(t);
    else if (films > 1) sum = films + ' ' + plural(films, 'фильм', 'фильма', 'фильмов');
    html += `<div class="tl-row js-open" data-id="${t.id}" style="--d:${(idx % 8) * 45}ms"><img src="${esc(coverSrc(t))}" alt="" loading="lazy" data-fb="${t.id}"><div><div class="tl-name">${esc(t.name)}</div><div class="tl-sub">${TYPE_SHORT[t.type]}${sum ? ' · ' + sum : ''}${eps ? ' · ' + eps + ' эп.' : ''} · тир ${t.tier}</div></div><div class="tl-date">${fmtDate(t.date)}</div></div>`;
    idx++;
  }
  box.innerHTML = html;
  if (window._tlIO) window._tlIO.disconnect();
  window._tlIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); window._tlIO.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px' });
  $$('#timeline .tl-row').forEach(r => window._tlIO.observe(r));
}

let calY, calM, calMode = 'grid', calListYear = null;
(function () { const n = new Date(); calY = n.getFullYear(); calM = n.getMonth(); })();

function yearPool() {
  const s = new Set([new Date().getFullYear()]);
  state.titles.forEach(t => { if (t.date && t.date.y) s.add(+t.date.y); (t.units || []).forEach(u => { if (u.date && u.date.y) s.add(+u.date.y); }); });
  return [...s].sort((a, b) => b - a);
}

function calEntries() {
  const out = [];
  for (const t of state.titles) {
    if (t.units && t.units.length) {
      let any = false;
      t.units.forEach((u, i) => { if (u.date) { out.push({ t, u, date: u.date, badge: KIND[u.kind].badge, color: KIND[u.kind].color, label: unitName(t, u, i) }); any = true; } });
      if (!any && t.date) out.push({ t, u: null, date: t.date, badge: '', color: '', label: '' });
    } else if (t.date) out.push({ t, u: null, date: t.date, badge: '', color: '', label: '' });
  }
  return out;
}

function calEvents() {
  const map = {};
  for (const e of calEntries()) {
    if (e.date.d != null) { const k = `${e.date.y}-${e.date.m}-${e.date.d}`; (map[k] ||= []).push(e); }
  }
  return map;
}

function renderCalendar() {
  const grid = calMode === 'grid';
  $('#cal-mode-grid').classList.toggle('on', grid);
  $('#cal-mode-list').classList.toggle('on', !grid);
  $('#cal-nav-block').classList.toggle('hidden', !grid);
  $('#cal-grid-wrap').classList.toggle('hidden', !grid);
  $('#cal-list-wrap').classList.toggle('hidden', grid);
  if (grid) renderCalGrid(); else renderCalList();
}

function renderCalGrid() {
  const ys = yearPool(); if (!ys.includes(calY)) { ys.push(calY); ys.sort((a, b) => b - a); }
  $('#cal-sel-m').innerHTML = MONTHS.map((m, i) => `<option value="${i}" ${i === calM ? 'selected' : ''}>${m}</option>`).join('');
  $('#cal-sel-y').innerHTML = ys.map(y => `<option value="${y}" ${y === calY ? 'selected' : ''}>${y}</option>`).join('');
  const evs = calEvents(), now = new Date();
  const start = (new Date(calY, calM, 1).getDay() + 6) % 7;
  const days = new Date(calY, calM + 1, 0).getDate();
  const cells = Math.ceil((start + days) / 7) * 7;
  let html = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map(d => `<div class="cal-dow">${d}</div>`).join('');
  for (let i = 0; i < cells; i++) {
    const d = i - start + 1;
    let out = false, y = calY, m = calM, dd = d;
    if (d < 1) { out = true; const pm = new Date(calY, calM, 0); dd = pm.getDate() + d; y = calM === 0 ? calY - 1 : calY; m = (calM + 11) % 12; }
    if (d > days) { out = true; dd = d - days; y = calM === 11 ? calY + 1 : calY; m = (calM + 1) % 12; }
    const list = out ? null : evs[`${y}-${m + 1}-${dd}`];
    const today = !out && y === now.getFullYear() && m === now.getMonth() && dd === now.getDate();
    let inner = `<span class="cal-num">${dd}</span>`;
    if (list) {
      const thumbs = list.slice(0, 3).map(e => `<span class="cal-thumb"><img src="${esc(coverSrc(e.t))}" alt="" data-fb="${e.t.id}">${e.badge ? `<i class="s-badge" style="background:${e.color}">${e.badge}</i>` : ''}</span>`).join('');
      inner += `<div class="cal-thumbs">${thumbs}${list.length > 3 ? `<span class="cal-more">+${list.length - 3}</span>` : ''}</div>`;
    }
    html += `<div class="cal-cell ${out ? 'out' : ''} ${today ? 'today' : ''} ${list ? 'has' : ''}" ${list ? `data-day="${y}-${m + 1}-${dd}"` : ''}>${inner}</div>`;
  }
  $('#cal-grid').innerHTML = html;
  $$('.cal-cell[data-day]').forEach(c => c.addEventListener('click', () => { const [y, m, d] = c.dataset.day.split('-').map(Number); openDay(y, m - 1, d); }));
}

function renderCalList() {
  const years = yearPool();
  $('#cal-years').innerHTML = `<button class="chip ${calListYear === null ? 'on' : ''}" data-y="all">Все годы</button>` + years.map(y => `<button class="chip ${calListYear === y ? 'on' : ''}" data-y="${y}">${y}</button>`).join('');
  $$('#cal-years .chip').forEach(b => b.onclick = () => { calListYear = b.dataset.y === 'all' ? null : +b.dataset.y; renderCalList(); });
  let items = calEntries().filter(e => e.date);
  if (calListYear) items = items.filter(e => e.date.y === calListYear);
  items.sort((a, b) => dateKey(b.date) - dateKey(a.date));
  const box = $('#cal-list');
  if (!items.length) { box.innerHTML = '<p class="tier-empty" style="padding:40px 0">Нет записей с датой просмотра</p>'; return; }
  let html = '', lastY = null;
  for (const e of items) {
    if (e.date.y !== lastY) { const n = items.filter(x => x.date.y === e.date.y).length; html += `<div class="cl-year"><b>${e.date.y}</b><span>${n} ${plural(n, 'запись', 'записи', 'записей')}</span></div>`; lastY = e.date.y; }
    let dpart;
    if (e.date.d != null) dpart = `<b>${e.date.d}</b><span>${MON_S[e.date.m - 1]} ${e.date.y}</span>`;
    else if (e.date.m != null) dpart = `<b class="mid">${MON_S[e.date.m - 1]}</b><span>${e.date.y}</span>`;
    else dpart = `<b class="mid">${e.date.y}</b><span>год</span>`;
    const sNote = e.u ? `${e.label}${e.u.kind === 'film' ? (e.u.minutes ? ' · ' + e.u.minutes + ' мин' : ' · фильм') : (e.u.episodes ? ' · ' + e.u.episodes + ' эп.' : '')} · ` : '';
    const eps = titleEpisodes(e.t);
    html += `<div class="cl-row js-open" data-id="${e.t.id}"><div class="cl-date">${dpart}</div><img src="${esc(coverSrc(e.t))}" alt="" loading="lazy" data-fb="${e.t.id}"><div class="cl-info"><div class="tl-name">${esc(e.t.name)}</div><div class="tl-sub">${sNote}${TYPE_SHORT[e.t.type]} · тир ${e.t.tier}${eps ? ' · ' + eps + ' эп. всего' : ''} · ${fmtDate(e.date)}</div></div><span class="cl-tier" style="--tc:${TIER_COLOR[e.t.tier]}">${e.t.tier}</span></div>`;
  }
  box.innerHTML = html;
}

function openDay(y, m, d) {
  const list = calEvents()[`${y}-${m + 1}-${d}`] || [];
  $('#m-day').innerHTML = `<button class="modal-x" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><h2>${d} ${MONTHS[m].toLowerCase()} ${y}</h2>${list.map(e => `<div class="day-item js-open" data-id="${e.t.id}"><img src="${esc(coverSrc(e.t))}" alt="" data-fb="${e.t.id}"><div><div class="tl-name">${esc(e.t.name)}</div><div class="tl-sub">${e.u ? `${e.label}${e.u.kind === 'film' ? (e.u.minutes ? ' · ' + e.u.minutes + ' мин' : ' · фильм') : (e.u.episodes ? ' · ' + e.u.episodes + ' эп.' : '')}` : TYPE_SHORT[e.t.type] + ' · тир ' + e.t.tier}</div></div></div>`).join('')}`;
  openOv('ov-day');
}

function renderStats() {
  const box = $('#stats');
  if (!state.titles.length) { box.innerHTML = '<p class="tier-empty" style="padding:40px 0">Статистика появится, как только в каталоге появятся тайтлы</p>'; return; }
  const t = totals();
  const byType = { tv: 0, film: 0, ova: 0, ona: 0 };
  const byTier = {}; TIERS.forEach(x => byTier[x] = 0);
  const byGenre = new Map(), byYear = new Map();
  let score = 0;
  for (const x of state.titles) {
    byType[x.type]++; byTier[x.tier]++; score += TIER_SCORE[x.tier];
    (x.genres || []).forEach(g => byGenre.set(g, (byGenre.get(g) || 0) + 1));
    if (x.date && x.date.y) byYear.set(x.date.y, (byYear.get(x.date.y) || 0) + 1);
  }
  const avg = score / state.titles.length, days = t.hours / 24;
  const verdict = avg >= 6.3 ? 'Безупречно — вы почти ничего не смотрите зря.' : avg >= 5.4 ? 'Требовательный вкус: планка высокая.' : avg >= 4.5 ? 'Сбалансированно: и классика, и эксперименты.' : avg >= 3.5 ? 'Широкие горизонты: количество не в ущерб интересу.' : 'Всеядность как метод исследования.';
  const dayCount = new Map();
  calEntries().forEach(e => { if (e.date && e.date.d != null) { const k = `${e.date.y}-${e.date.m}-${e.date.d}`; dayCount.set(k, (dayCount.get(k) || 0) + 1); } });
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ y: d.getFullYear(), m: d.getMonth() }); }
  const hmCols = months.map(({ y, m }) => {
    const dim = new Date(y, m + 1, 0).getDate();
    let cells = '';
    for (let dd = 1; dd <= 31; dd++) {
      if (dd > dim) { cells += `<span class="hm-cell ghost"></span>`; continue; }
      const n = dayCount.get(`${y}-${m + 1}-${dd}`) || 0;
      const lvl = n === 0 ? 0 : n < 2 ? 1 : n < 4 ? 2 : 3;
      cells += `<span class="hm-cell" data-l="${lvl}" title="${dd}.${m + 1}.${y} — ${n} ${plural(n, 'запись', 'записи', 'записей')}"></span>`;
    }
    return `<div class="hm-col"><div class="hm-cells">${cells}</div><span class="hm-lab">${MON_S[m]}</span></div>`;
  }).join('');
  const bigEps = state.titles.reduce((a, b) => titleEpisodes(b) > titleEpisodes(a) ? b : a);
  const bigMin = state.titles.reduce((a, b) => titleMinutes(b) > titleMinutes(a) ? b : a);
  const genresTop = [...byGenre.entries()].sort((a, b) => b[1] - a[1]);
  const favG = genresTop[0];
  const activeDays = dayCount.size;
  const dcol = { tv: '#ff7aa2', film: '#ffd76e', ova: '#9ddba8', ona: '#b39ddb' };
  const C = 2 * Math.PI * 44;
  let acc = 0, segs = '';
  for (const tp of TYPES) {
    const v = byType[tp.id]; if (!v) continue;
    const len = Math.max(v / t.n * C - 3, 0.5);
    segs += `<circle class="donut-seg" cx="50" cy="50" r="44" fill="none" stroke="${dcol[tp.id]}" stroke-width="11" stroke-dasharray="0 ${C.toFixed(2)}" data-dash="${len.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 50 50)"/>`;
    acc += v / t.n * C;
  }
  const legend = TYPES.map(tp => byType[tp.id] ? `<div class="dl-row"><span class="dl-dot" style="background:${dcol[tp.id]}"></span><b>${TYPE_SHORT[tp.id]}</b> · ${tp.label}<span class="dl-v">${byType[tp.id]} · ${(byType[tp.id] / t.n * 100).toFixed(0)}%</span></div>` : '').join('');
  const barRow = (label, val, max, color, note) => `<div class="bar"><div class="bar-l">${label}</div><div class="bar-track"><div class="bar-fill" data-w="${max ? Math.max(3, val / max * 100) : 0}" style="background:${color}"></div></div><div class="bar-v">${note || val}</div></div>`;
  const barsTiers = TIERS.map(x => barRow(`<b>${x}</b> · ${TIER_EPITHET[x].toLowerCase()}`, byTier[x], t.n, TIER_COLOR[x])).join('');
  const barsGenres = genresTop.slice(0, 10).map(([g, v]) => barRow(esc(g), v, genresTop[0][1], 'var(--accent)', `${(v / t.n * 100).toFixed(0)}%`)).join('') || '<p class="bar-note">Жанры не указаны</p>';
  const years = [...byYear.entries()].sort((a, b) => a[0] - b[0]);
  const barsYears = years.length ? years.map(([y, v]) => barRow(`<b>${y}</b>`, v, Math.max(...years.map(e => e[1])), 'var(--accent)')).join('') : '<p class="bar-note">Нет записей с датой</p>';
  const spectrum = TIERS.map(x => `<span style="background:${TIER_COLOR[x]}" data-w="${(byTier[x] / t.n * 100).toFixed(2)}" title="${x}: ${byTier[x]}"></span>`).join('');
  box.innerHTML = `<div class="stats-grid"><div class="stat-big"><div class="sb-item"><div class="sb-v" data-num="${t.n}">0</div><div class="sb-l">тайтлов всего</div><div class="sb-s">из них с датой: ${state.titles.filter(x => x.date).length}</div></div><div class="mini-grid"><div class="sb-item sm"><div class="sb-v" data-num="${t.eps}">0</div><div class="sb-l">серий</div><div class="sb-s">≈ ${(t.eps / t.n).toFixed(0)} на тайтл</div></div><div class="sb-item sm"><div class="sb-v" data-num="${t.films}">0</div><div class="sb-l">фильмов</div><div class="sb-s">${(t.films / t.n * 100).toFixed(0)}% коллекции</div></div><div class="sb-item sm"><div class="sb-v" data-num="${Math.round(t.hours)}">0</div><div class="sb-l">часов</div><div class="sb-s">≈ ${(t.hours / t.n).toFixed(1)} ч на тайтл</div></div><div class="sb-item sm"><div class="sb-v" data-num="${activeDays}">0</div><div class="sb-l">активных дней</div><div class="sb-s">дней с завершённым просмотром</div></div></div><div class="taste"><div class="taste-head"><b>ИНДЕКС ВКУСА</b><span class="taste-score">${avg.toFixed(1)}</span></div><div class="taste-scale"><span class="taste-mark" style="left:${((avg - 1) / 6 * 100).toFixed(1)}%"><svg viewBox="0 0 24 24" width="14" height="14" fill="var(--accent)"><path d="M12 2 C 15.5 6.5, 20 8.5, 20 13.5 C 20 18, 15.5 21, 12 22 C 8.5 21, 4 18, 4 13.5 C 4 8.5, 8.5 6.5, 12 2 Z"/></svg></span></div><div class="taste-ticks"><span>E</span><span>C</span><span>A</span><span>SSS</span></div><p class="taste-verdict">${verdict}</p></div><div class="donut-panel"><h3>Рекорды коллекции</h3><div class="rec-grid"><div class="rec-card js-open" data-id="${bigEps.id}"><div class="rec-k">Самый объёмный</div><div class="rec-v">${esc(bigEps.name)}</div><div class="rec-s">${titleEpisodes(bigEps)} серий · тир ${bigEps.tier}</div></div><div class="rec-card js-open" data-id="${bigMin.id}"><div class="rec-k">Больше всех времени</div><div class="rec-v">${esc(bigMin.name)}</div><div class="rec-s">≈ ${fmtDur(titleMinutes(bigMin))} · тир ${bigMin.tier}</div></div>${favG ? `<div class="rec-card"><div class="rec-k">Любимый жанр</div><div class="rec-v">${esc(favG[0])}</div><div class="rec-s">${favG[1]} ${plural(favG[1], 'тайтл', 'тайтла', 'тайтлов')} · ${(favG[1] / t.n * 100).toFixed(0)}% коллекции</div></div>` : ''}</div></div></div><div class="bars"><div class="donut-panel"><h3>Состав коллекции</h3><div class="donut-wrap"><svg viewBox="0 0 100 100" class="donut">${segs}<text x="50" y="47" class="donut-n">${t.n}</text><text x="50" y="60" class="donut-l">ВСЕГО</text></svg><div class="donut-legend">${legend}</div></div></div><h3>Активность за 12 месяцев</h3><div class="heatmap-wrap">${hmCols}</div><div class="hm-legend">реже<i style="background:var(--panel2)"></i><i style="background:color-mix(in srgb,var(--accent) 30%,var(--panel2))"></i><i style="background:color-mix(in srgb,var(--accent) 60%,var(--panel2))"></i><i style="background:var(--accent)"></i>чаще</div><h3>Спектр тиров</h3><div class="spectrum">${spectrum}</div><div class="spec-legend"><span>SSS</span><span>S</span><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span></div><h3>По тирам</h3>${barsTiers}<h3>По жанрам · топ-10</h3>${barsGenres}<h3>По годам просмотра</h3>${barsYears}<p class="bar-note">Время считается так: сезоны, спешлы и OVA/ONA-эпизоды × длительность серии, фильмы × длительность.</p></div></div>`;
  $$('#stats .sb-v').forEach(el => animNum(el, +el.dataset.num));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('#stats .bar-fill').forEach(f => f.style.width = f.dataset.w + '%');
    $$('#stats .donut-seg').forEach(s => s.setAttribute('stroke-dasharray', s.dataset.dash));
    $$('#stats .spectrum span').forEach(s => s.style.width = s.dataset.w + '%');
  }));
}

/* ================= детали тайтла ================= */
function openTitle(id) {
  const t = findTitle(id);
  if (!t) return;
  const u = t.units || [];
  const eps = titleEpisodes(t), films = titleFilms(t);
  const seasonsN = u.filter(x => x.kind === 'season').length;
  const specs = [];
  if (t.type === 'tv') {
    specs.push(['Сезоны', seasonsN || '—']);
    const se = u.filter(x => x.kind === 'season').reduce((a, x) => a + x.episodes, 0);
    const extras = [];
    ['special', 'ova', 'ona'].forEach(k => { const n = u.filter(x => x.kind === k).reduce((a, x) => a + x.episodes, 0); if (n) extras.push(`${KIND[k].label} ${n}`); });
    specs.push(['Серии', eps + (extras.length ? ` (${se} + ${extras.join(' + ')})` : '')]);
    if (films) specs.push(['Фильмы', films]);
  } else {
    specs.push(['Записи', u.length]);
    if (eps) specs.push(['Эпизоды', eps]);
  }
  specs.push(['Дата просмотра', fmtDate(t.date)]);
  specs.push(['Затрачено', '≈ ' + fmtDur(titleMinutes(t))]);
  specs.push(['В счёт статистики', t.type === 'film' ? `${films} ${plural(films, 'фильм', 'фильма', 'фильмов')}` : `${eps} серий` + (t.type === 'tv' && films ? ` + ${films} ${plural(films, 'фильм', 'фильма', 'фильмов')}` : '')]);
  const unitsHTML = u.length ? `<div class="du-head">${t.type === 'tv' ? 'Порядок просмотра' : 'Записи'}</div><div class="dt-units">${u.map((x, i) => { const main = x.kind === 'film' ? (x.minutes ? x.minutes + ' мин' : 'фильм') : `${x.episodes} ${plural(x.episodes, 'серия', 'серии', 'серий')}`; return `<div class="dt-unit" style="--uc:${KIND[x.kind].color}"><b>${KIND[x.kind].badge}</b><span class="du-name">${esc(unitName(t, x, i))}</span><span class="du-eps">${main}</span><span class="du-date">${fmtDate(x.date)}</span></div>`; }).join('')}</div>` : '';
  $('#m-title').innerHTML = `<button class="modal-x" data-close><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="dt-grid"><div class="dt-cover"><img src="${esc(coverSrc(t))}" alt="${esc(t.name)}" data-fb="${t.id}"></div><div class="dt-info"><div class="dt-tierline"><span class="tier-badge" style="background:${TIER_COLOR[t.tier]}">${t.tier}</span><span class="dt-type">${TYPES.find(x => x.id === t.type).label} · ${TIER_EPITHET[t.tier].toLowerCase()}</span></div><h2 class="dt-name">${esc(t.name)}</h2><div class="dt-genres">${(t.genres || []).map(g => `<span>${esc(g)}</span>`).join('') || '<span>жанры не указаны</span>'}</div>${unitsHTML}<dl class="dt-specs">${specs.map(([k, v]) => `<div class="dt-spec"><dt>${k}</dt><dd${k === 'Затрачено' || k === 'Дата просмотра' ? ' class="accent"' : ''}>${v}</dd></div>`).join('')}</dl>${t.notes ? `<p class="dt-notes">${esc(t.notes)}</p>` : ''}<div class="dt-actions"><button class="btn btn-danger" id="dt-del"><svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>Удалить</button><button class="btn" id="dt-share"><svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>Ссылка</button><button class="btn" id="dt-edit"><svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4.5-1L19 8.5a2.1 2.1 0 0 0-3-3L5.5 16 4 20z"/></svg>Редактировать</button></div></div></div>`;
  $('#dt-edit').onclick = () => { closeOv('ov-title'); openForm(t.id); };
  $('#dt-share').onclick = () => {
    const url = location.origin + location.pathname + '?title=' + t.id;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
      .then(() => toast('Ссылка на тайтл скопирована'))
      .catch(() => { prompt('Скопируйте ссылку:', url); });
  };
  $('#dt-del').onclick = () => openConfirm({
    title: 'Удалить тайтл?', text: `«${esc(t.name)}» будет убран из каталога безвозвратно.`,
    okLabel: 'Удалить', danger: true,
    onOk() { state.titles = state.titles.filter(x => x.id !== t.id); save(); renderAll(); toast('Тайтл удалён'); }
  });
  openOv('ov-title');
}

/* ================= форма ================= */
let editId = null, formCover = '', formType = 'tv', formTier = 'A';
let formGenres = new Set(), extraChips = [], fGenreQuery = '';
let formUnits = [];

function openForm(id = null) {
  editId = id;
  const t = id ? findTitle(id) : null;
  formCover = t ? (t.cover || '') : '';
  formType = t ? t.type : 'tv';
  formTier = t ? t.tier : 'A';
  formGenres = new Set(t ? (t.genres || []) : []);
  extraChips = []; fGenreQuery = '';
  formUnits = t && (t.units || []).length
    ? t.units.map(x => ({ kind: x.kind, name: x.name || '', count: x.kind === 'film' ? (x.minutes ? String(x.minutes) : '') : (x.episodes ? String(x.episodes) : ''), date: x.date ? fmtDate(x.date) : '', err: false }))
    : [{ kind: DEF_KIND[formType], name: '', count: '', date: '', err: false }];
  $('#form-title').textContent = t ? 'Редактировать тайтл' : 'Новый тайтл';
  $('#f-name').value = t ? t.name : '';
  $('#f-cover-url').value = t && t.cover && !t.cover.startsWith('data:') ? t.cover : '';
  $('#f-episodes').value = '';
  $('#f-date').value = '';
  $('#f-minutes').value = t && t.minutes ? t.minutes : '';
  $('#f-notes').value = t ? (t.notes || '') : '';
  $('#f-genre-search').value = '';
  $('#w-name').classList.remove('error');
  $('#units-box').classList.remove('has-err');
  buildTierSeg(); buildTypeSeg(); buildGenreChips(); renderUnitRows();
  syncFormType(); updatePreview(); updateEstimate();
  openOv('ov-form');
  setTimeout(() => $('#f-name').focus(), 80);
}

function buildTierSeg() {
  $('#f-tier').innerHTML = TIERS.map(x => `<button type="button" class="seg-btn ${formTier === x ? 'on' : ''}" data-t="${x}" style="--tc:${TIER_COLOR[x]}">${x}</button>`).join('');
  $$('#f-tier .seg-btn').forEach(b => b.onclick = () => { formTier = b.dataset.t; buildTierSeg(); updatePreview(); });
}

function buildTypeSeg() {
  $('#f-type').innerHTML = TYPES.map(x => `<button type="button" class="seg-btn ${formType === x.id ? 'on' : ''}" data-t="${x.id}">${x.label}</button>`).join('');
  $$('#f-type .seg-btn').forEach(b => b.onclick = () => {
    if (formType === b.dataset.t) return;
    formType = b.dataset.t;
    buildTypeSeg();
    formUnits = [{ kind: DEF_KIND[formType], name: '', count: '', date: '', err: false }];
    syncFormType(); renderUnitRows(); updateEstimate();
  });
}

function syncFormType() {
  const tv = formType === 'tv', film = formType === 'film';
  $('#units-block').style.display = '';
  $('#w-episodes').style.display = 'none';
  $('#w-date').style.display = 'none';
  $('#w-minutes2').style.display = film ? 'none' : '';
  $('#l-minutes').textContent = 'Длительность эпизода';
  $('#units-label').textContent = tv ? 'Структура просмотра — сезоны, фильмы, спешлы, OVA и ONA в любом порядке' : 'Записи — название каждой вы задаёте сами, в любом количестве';
  renderUnitsAddButtons();
}

function buildGenreChips() {
  const sel = $('#f-genres-selected');
  sel.innerHTML = [...formGenres].map(g => `<button type="button" class="chip on" data-frm-unselect="${esc(g)}">${esc(g)} ×</button>`).join('');
  const pool = [...new Set([...GENRES, ...extraChips])].sort((a, b) => a.localeCompare(b, 'ru'));
  const q = fGenreQuery.toLowerCase();
  const list = q ? pool.filter(g => g.toLowerCase().includes(q)) : pool;
  $('#f-genres').innerHTML = list.length ? list.map(g => `<button type="button" class="chip ${formGenres.has(g) ? 'on' : ''}" data-frm-g="${esc(g)}">${esc(g)}</button>`).join('') : '<span class="gp-empty">Ничего не найдено</span>';
  $$('[data-frm-g]').forEach(b => b.onclick = () => { const g = b.dataset.frmG; formGenres.has(g) ? formGenres.delete(g) : formGenres.add(g); buildGenreChips(); });
  $$('[data-frm-unselect]').forEach(b => b.onclick = () => { formGenres.delete(b.dataset.frmUnselect); buildGenreChips(); });
}

$('#f-genre-search').addEventListener('input', e => { fGenreQuery = e.target.value; buildGenreChips(); });

function addCustomGenre() {
  const v = $('#f-genre-new').value.trim();
  if (!v) return;
  if (v.length > 40) { toast('Слишком длинное название жанра', 'warn'); return; }
  extraChips.push(v); formGenres.add(v);
  $('#f-genre-new').value = '';
  buildGenreChips();
}
$('#f-genre-add').onclick = addCustomGenre;
$('#f-genre-new').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addCustomGenre(); } });

function renderUnitsAddButtons() {
  const box = $('#units-add');
  const tv = formType === 'tv';
  const btn = (kind, label) => `<button type="button" class="u-add" data-ukind="${kind}" style="--kc:${KIND[kind].color}"><i></i>${label}</button>`;
  box.innerHTML = tv ? btn('season', 'Сезон') + btn('film', 'Фильм') + btn('special', 'Спешл') + btn('ova', 'OVA') + btn('ona', 'ONA') : btn(DEF_KIND[formType], 'Запись');
  $$('.u-add').forEach(b => b.onclick = () => { formUnits.push({ kind: b.dataset.ukind, name: '', count: '', date: '', err: false }); renderUnitRows(formUnits.length - 1); const list = $('#units-list'); list.scrollTop = list.scrollHeight; });
}

function renderUnitRows(popIdx = -1) {
  const list = $('#units-list');
  const tv = formType === 'tv';
  list.innerHTML = formUnits.map((r, i) => {
    const k = KIND[r.kind];
    const isFilm = r.kind === 'film';
    const typeSel = tv ? `<select class="urow-type">${KIND_ORDER.map(kk => `<option value="${kk}" ${r.kind === kk ? 'selected' : ''}>${KIND[kk].label}</option>`).join('')}</select>` : '';
    const phName = tv ? (r.kind === 'season' ? 'напр. Сезон 1' : 'название') : 'название — напр. Часть 1';
    return `<div class="urow ${tv ? '' : 'nosel'} ${r.err ? 'err' : ''} ${i === popIdx ? 'pop' : ''}" data-i="${i}" style="--uc:${k.color}"><span class="urow-badge" title="${esc(k.label)}">${k.badge}</span>${typeSel}<input type="text" placeholder="${phName}" value="${esc(r.name)}" data-k="name" maxlength="80" autocomplete="off" spellcheck="false"><input type="number" min="0" max="5000" placeholder="${isFilm ? 'мин' : 'серий'}" value="${esc(r.count)}" data-k="count" autocomplete="off"><input placeholder="ДД.ММ.ГГГГ" value="${esc(r.date)}" data-k="date" autocomplete="off" spellcheck="false"><button type="button" class="srow-del" data-del="${i}" title="Удалить">×</button></div>`;
  }).join('');
  list.classList.toggle('scrolled', formUnits.length > 7);
  updateUnitsSummary();
}

function updateUnitsSummary() {
  const n = formUnits.length;
  if (formType !== 'tv') {
    let s = `${n} ${plural(n, 'запись', 'записи', 'записей')}`;
    if (formType === 'film') { const mins = formUnits.reduce((a, r) => a + (parseInt(r.count, 10) || 0), 0); if (mins) s += ` · ${mins} мин`; }
    else { const eps = formUnits.reduce((a, r) => a + (parseInt(r.count, 10) || 0), 0); if (eps) s += ` · ${eps} ${plural(eps, 'эпизод', 'эпизода', 'эпизодов')}`; }
    $('#units-sum').textContent = s;
    return;
  }
  const s = formUnits.filter(r => r.kind === 'season').length;
  const f = formUnits.filter(r => r.kind === 'film').length;
  const sp = formUnits.filter(r => r.kind === 'special').length;
  const ov = formUnits.filter(r => r.kind === 'ova').length;
  const on = formUnits.filter(r => r.kind === 'ona').length;
  const eps = formUnits.filter(r => r.kind !== 'film').reduce((a, r) => a + (parseInt(r.count, 10) || 0), 0);
  const parts = [];
  if (s) parts.push(`${s} ${plural(s, 'сезон', 'сезона', 'сезонов')}`);
  if (f) parts.push(`${f} ${plural(f, 'фильм', 'фильма', 'фильмов')}`);
  if (sp) parts.push(`${sp} спешл`);
  if (ov) parts.push(`${ov} OVA`);
  if (on) parts.push(`${on} ONA`);
  parts.push(`${eps} ${plural(eps, 'серия', 'серии', 'серий')}`);
  $('#units-sum').textContent = parts.join(' · ');
}

$('#units-list').addEventListener('input', e => {
  const row = e.target.closest('.urow'); if (!row) return;
  const r = formUnits[+row.dataset.i];
  if (e.target.dataset.k === 'name') r.name = e.target.value;
  if (e.target.dataset.k === 'count') r.count = e.target.value;
  if (e.target.dataset.k === 'date') r.date = e.target.value;
  if (e.target.dataset.k === 'count') updateUnitsSummary();
  updateEstimate();
});
$('#units-list').addEventListener('change', e => {
  if (e.target.classList.contains('urow-type')) {
    const row = e.target.closest('.urow');
    formUnits[+row.dataset.i].kind = e.target.value;
    renderUnitRows(); updateEstimate();
  }
});
$('#units-list').addEventListener('click', e => {
  const del = e.target.closest('[data-del]');
  if (!del) return;
  formUnits.splice(+del.dataset.del, 1);
  renderUnitRows(); updateEstimate();
});

function collectUnits() {
  let bad = -1;
  const units = formUnits.map((r, i) => {
    const d = r.date.trim() ? parseDate(r.date) : null;
    if (d && d.err) bad = i;
    const count = parseInt(r.count, 10);
    const name = r.name.trim().slice(0, 80);
    if (r.kind === 'film') return { kind: 'film', name, episodes: 0, minutes: (!isNaN(count) && count > 0) ? count : null, date: d && !d.err ? d : null };
    return { kind: r.kind, name, episodes: isNaN(count) || count < 0 ? 0 : count, minutes: null, date: d && !d.err ? d : null };
  });
  return { units, bad };
}

function updatePreview() { $('#f-preview').src = coverSrc({ name: $('#f-name').value || '?', tier: formTier, cover: formCover }); }

function updateEstimate() {
  let total = 0;
  const m = parseInt($('#f-minutes').value, 10);
  if (formType === 'film') {
    formUnits.forEach(r => { const c = parseInt(r.count, 10) || 0; total += c > 0 ? c : settings.filmMin; });
  } else {
    let eps = 0, fmin = 0;
    formUnits.forEach(r => {
      const c = parseInt(r.count, 10) || 0;
      if (r.kind === 'film') { fmin += c > 0 ? c : settings.filmMin; } else eps += c;
    });
    const epM = m > 0 ? m : settings.epMin;
    total = eps * epM + fmin;
  }
  $('#f-estimate').textContent = total > 0 ? `≈ ${fmtDur(total)} просмотра попадёт в статистику` : '';
}

$('#f-name').addEventListener('input', updatePreview);
$('#f-cover-url').addEventListener('input', e => { formCover = e.target.value.trim(); updatePreview(); });
['#f-episodes', '#f-minutes'].forEach(s => $(s).addEventListener('input', updateEstimate));

$('#f-cover-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    formCover = await compressImage(file, 420, .72);
    $('#f-cover-url').value = '';
    updatePreview();
    toast('Обложка сжата и готова');
  } catch (err) { toast('Не удалось прочитать файл изображения', 'warn'); }
  e.target.value = '';
});
$('#f-cover-clear').onclick = () => { formCover = ''; $('#f-cover-url').value = ''; updatePreview(); };

$('#title-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#f-name').value.trim();
  $('#w-name').classList.toggle('error', !name);
  if (!name) return;
  const col = collectUnits();
  if (col.bad >= 0) {
    formUnits.forEach((r, i) => r.err = (i === col.bad));
    $('#units-box').classList.add('has-err');
    renderUnitRows();
    toast('Проверьте формат даты в строке ' + (col.bad + 1), 'warn');
    return;
  }
  const units = col.units;
  const mainDate = [...units].reverse().find(x => x.date)?.date || null;
  const minutes = parseInt($('#f-minutes').value, 10);
  const data = {
    name, cover: formCover || '', tier: formTier, type: formType,
    genres: [...formGenres], units,
    episodes: (formType === 'ova' || formType === 'ona') ? units.reduce((s, u) => s + (u.kind !== 'film' ? u.episodes : 0), 0) : 0,
    date: mainDate,
    minutes: (formType !== 'film' && !isNaN(minutes) && minutes > 0) ? minutes : null,
    notes: $('#f-notes').value.trim()
  };
  if (editId) {
    Object.assign(findTitle(editId), data);
    toast('Изменения сохранены');
  } else {
    state.titles.push({ id: uid(), createdAt: Date.now(), ...data });
    toast('Тайтл добавлен');
  }
  const r = $('#f-submit').getBoundingClientRect();
  if (Particles.burst) Particles.burst(r.left + r.width / 2, r.top + r.height / 2, 18);
  save();
  closeOv('ov-form');
  renderAll();
});

/* ================= настройки ================= */
const TEMPO = { calm: 1.5, normal: 1, lively: .6, instant: .15 };

function applySettings() {
  const s = settings, b = document.body, root = document.documentElement;
  b.classList.toggle('light', !!s.light);
  b.classList.toggle('no-anim', !s.anim);
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
  b.classList.toggle('pets-front', !!s.petsFront);
  b.dataset.embanim = ['full', 'float', 'off'].includes(s.emblemAnim) ? s.emblemAnim : 'full';
  root.style.setProperty('--accent', ACCENTS[s.accent] || ACCENTS.sakura);
  root.style.setProperty('--bg-dim', (s.bgDim / 100).toFixed(2));
  root.style.setProperty('--sp', (TEMPO[s.tempo] || 1));
  root.style.setProperty('--tes', s.embAnimSpeed + 's');
  root.style.setProperty('--pa', s.panelOp + '%');
  root.style.setProperty('--rad', s.radius + 'px');
  root.style.setProperty('--branch-alpha', (s.branchAlpha / 100).toFixed(2));
  applyUserBg();
  Particles.refresh();
}

function applyUserBg() {
  let bg = null;
  try { bg = localStorage.getItem(LS_BG); } catch (e) {}
  document.body.classList.toggle('has-bg', !!bg);
  if (bg) document.documentElement.style.setProperty('--user-img', `url("${bg}")`);
}

$('#bg-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const d = await compressImage(file, 1600, .8);
    try { localStorage.setItem(LS_BG, d); }
    catch (err) { toast('Картинка не поместилась в локальное хранилище — попробуйте меньше', 'warn'); return; }
    applyUserBg(); toast('Фоновая картина обновлена');
  } catch (err) { toast('Не удалось прочитать файл изображения', 'warn'); }
  e.target.value = '';
});
$('#bg-remove').onclick = () => { try { localStorage.removeItem(LS_BG); } catch (e) {} applyUserBg(); toast('Фоновая картина убрана'); };

window.addEventListener('pointermove', e => {
  const k = (settings.parallax || 0) / 100 * 16;
  if (!k || !settings.branches) return;
  const mx = e.clientX / innerWidth - .5, my = e.clientY / innerHeight - .5;
  const tr = $('#branch-tr'), bl = $('#branch-bl');
  if (tr) tr.style.transform = `translate(${(-mx * k).toFixed(1)}px,${(-my * k * .6).toFixed(1)}px)`;
  if (bl) bl.style.transform = `translate(${(mx * k * .7).toFixed(1)}px,${(my * k * .5).toFixed(1)}px)`;
}, { passive: true });

function bindSettings() {
  $('#sel-pstyle').innerHTML = Object.entries(PRESETS).map(([k, p]) => `<option value="${k}">${esc(p.label)}</option>`).join('');
  $('#sel-bstyle').innerHTML = Object.entries(TREE_STYLES).map(([k, b]) => `<option value="${k}">${esc(b.label)}</option>`).join('');
  $('#sel-tempo').value = settings.tempo;
  $('#sel-pstyle').value = PRESETS[settings.particleStyle] ? settings.particleStyle : 'sakura';
  $('#sel-bstyle').value = TREE_STYLES[settings.branchStyle] ? settings.branchStyle : 'sakura';
  $('#sel-catview').value = ['posters', 'chips', 'list'].includes(settings.catalogView) ? settings.catalogView : 'posters';
  $('#sel-embanim').value = ['full', 'float', 'off'].includes(settings.emblemAnim) ? settings.emblemAnim : 'full';
  $('#sel-pstyle').addEventListener('change', e => { settings.particleStyle = e.target.value; persistSettings(); Particles.restyle(); });
  $('#sel-bstyle').addEventListener('change', e => { settings.branchStyle = e.target.value; persistSettings(); renderTrees(); });
  $('#sel-tempo').addEventListener('change', e => { settings.tempo = e.target.value; persistSettings(); applySettings(); });
  $('#sel-catview').addEventListener('change', e => { settings.catalogView = e.target.value; persistSettings(); renderTierlist(true); });
  $('#sel-embanim').addEventListener('change', e => { settings.emblemAnim = e.target.value; persistSettings(); applySettings(); });
  const map = { anim: 's-anim', rowAnim: 's-rowanim', cascade: 's-cascade', modalPop: 's-modalpop', toastAnim: 's-toastanim', pillGlow: 's-pillglow', tierGlow: 's-tierglow', tierBg: 's-tierbg', tilt: 's-tilt', cardLift: 's-lift', glow: 's-glow', shine: 's-shine', counters: 's-counters', recent: 's-recent', light: 's-light', particles: 's-particles', particleSpin: 's-pspin', twinkle: 's-twinkle', petsFront: 's-petsfront', branches: 's-branches', sway: 's-sway', ambient: 's-ambient', moon: 's-moon' };
  for (const [key, id] of Object.entries(map)) {
    $('#' + id).checked = !!settings[key];
    $('#' + id).addEventListener('change', e => { settings[key] = e.target.checked; persistSettings(); applySettings(); renderAll(); });
  }
  const range = (rid, vid, key, fmt, after) => {
    const r = $('#' + rid);
    r.value = settings[key];
    $('#' + vid).textContent = fmt(settings[key]);
    r.addEventListener('input', () => {
      settings[key] = +r.value;
      $('#' + vid).textContent = fmt(+r.value);
      if (after) after();
      Particles.refresh(); persistSettings();
    });
  };
  range('s-density', 'v-density', 'petalDensity', v => v + '%');
  range('s-fall', 'v-fall', 'fallSpeed', v => v + '%');
  range('s-psize', 'v-psize', 'particleSize', v => v + '%');
  range('s-palpha', 'v-palpha', 'particleOpacity', v => v + '%');
  range('s-wind', 'v-wind', 'wind', v => (v / 100).toFixed(1) + '×');
  range('s-parallax', 'v-parallax', 'parallax', v => v + '%');
  range('s-balpha', 'v-balpha', 'branchAlpha', v => v + '%', applySettings);
  range('s-bgdim', 'v-bgdim', 'bgDim', v => v + '%');
  range('s-embanimspd', 'v-embanimspd', 'embAnimSpeed', v => v + ' с', applySettings);
  range('s-tiltpow', 'v-tiltpow', 'tiltPower', v => '±' + v + '°');
  range('s-cntspd', 'v-cntspd', 'counterSpeed', v => v + ' мс');
  range('s-panelop', 'v-panelop', 'panelOp', v => v + '%', applySettings);
  range('s-radius', 'v-radius', 'radius', v => v + ' px', applySettings);
  $$('#acc-pick button').forEach(b => {
    b.classList.toggle('on', settings.accent === b.dataset.acc);
    b.onclick = () => {
      settings.accent = b.dataset.acc;
      $$('#acc-pick button').forEach(x => x.classList.toggle('on', x === b));
      persistSettings(); applySettings();
    };
  });
  $('#s-epmin').value = settings.epMin;
  $('#s-filmmin').value = settings.filmMin;
  const numHandler = (id, key) => $('#' + id).addEventListener('change', e => {
    let v = parseInt(e.target.value, 10);
    if (isNaN(v) || v < 1) v = DEFAULT_SETTINGS[key];
    if (v > 600) v = 600;
    e.target.value = v; settings[key] = v;
    persistSettings(); renderAll();
  });
  numHandler('s-epmin', 'epMin'); numHandler('s-filmmin', 'filmMin');
}

function bindSettingsValues() {
  const map = { anim: 's-anim', rowAnim: 's-rowanim', cascade: 's-cascade', modalPop: 's-modalpop', toastAnim: 's-toastanim', pillGlow: 's-pillglow', tierGlow: 's-tierglow', tierBg: 's-tierbg', tilt: 's-tilt', cardLift: 's-lift', glow: 's-glow', shine: 's-shine', counters: 's-counters', recent: 's-recent', light: 's-light', particles: 's-particles', particleSpin: 's-pspin', twinkle: 's-twinkle', petsFront: 's-petsfront', branches: 's-branches', sway: 's-sway', ambient: 's-ambient', moon: 's-moon' };
  for (const [k, id] of Object.entries(map)) $('#' + id).checked = !!settings[k];
  const rv = (rid, vid, key, fmt) => { $('#' + rid).value = settings[key]; $('#' + vid).textContent = fmt(settings[key]); };
  rv('s-density', 'v-density', 'petalDensity', v => v + '%');
  rv('s-fall', 'v-fall', 'fallSpeed', v => v + '%');
  rv('s-psize', 'v-psize', 'particleSize', v => v + '%');
  rv('s-palpha', 'v-palpha', 'particleOpacity', v => v + '%');
  rv('s-wind', 'v-wind', 'wind', v => (v / 100).toFixed(1) + '×');
  rv('s-parallax', 'v-parallax', 'parallax', v => v + '%');
  rv('s-balpha', 'v-balpha', 'branchAlpha', v => v + '%');
  rv('s-bgdim', 'v-bgdim', 'bgDim', v => v + '%');
  rv('s-embanimspd', 'v-embanimspd', 'embAnimSpeed', v => v + ' с');
  rv('s-tiltpow', 'v-tiltpow', 'tiltPower', v => '±' + v + '°');
  rv('s-cntspd', 'v-cntspd', 'counterSpeed', v => v + ' мс');
  rv('s-panelop', 'v-panelop', 'panelOp', v => v + '%');
  rv('s-radius', 'v-radius', 'radius', v => v + ' px');
  $('#sel-tempo').value = settings.tempo;
  $('#sel-pstyle').value = PRESETS[settings.particleStyle] ? settings.particleStyle : 'sakura';
  $('#sel-bstyle').value = TREE_STYLES[settings.branchStyle] ? settings.branchStyle : 'sakura';
  $('#sel-catview').value = ['posters', 'chips', 'list'].includes(settings.catalogView) ? settings.catalogView : 'posters';
  $('#sel-embanim').value = ['full', 'float', 'off'].includes(settings.emblemAnim) ? settings.emblemAnim : 'full';
  $$('#acc-pick button').forEach(b => b.classList.toggle('on', settings.accent === b.dataset.acc));
  $('#s-epmin').value = settings.epMin;
  $('#s-filmmin').value = settings.filmMin;
}

$('#btn-reset-set').onclick = () => openConfirm({
  title: 'Вернуть стандартные настройки?',
  text: 'Оформление, эффекты и атмосфера сбросятся к исходным — только в вашем браузере. Каталог и вход не затрагиваются.',
  okLabel: 'Сбросить',
  onOk() { settings = { ...DEFAULT_SETTINGS }; persistSettings(); applySettings(); bindSettingsValues(); renderTrees(); Particles.restyle(); renderAll(); toast('Настройки возвращены к стандартным'); }
});

$('#btn-export').onclick = () => {
  const blob = new Blob([JSON.stringify({ v: 3, updatedAt: state.updatedAt, titles: state.titles, settings }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'anime-catalog.json';
  a.click(); URL.revokeObjectURL(a.href);
  toast('Экспорт готов');
};
$('#btn-import').onclick = () => $('#file-import').click();
$('#file-import').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    let data;
    try { data = JSON.parse(r.result); } catch { toast('Файл не является корректным JSON', 'warn'); return; }
    const arr = Array.isArray(data) ? data : (Array.isArray(data.titles) ? data.titles : null);
    if (!arr) { toast('В файле не найден список тайтлов', 'warn'); return; }
    openConfirm({
      title: 'Импорт тайтлов',
      text: `В файле ${arr.length} тайтлов. Заменить каталог или добавить к нему?`,
      okLabel: 'Заменить каталог', danger: true, cancel: true,
      onOk() { state.titles = arr.map(normalizeTitle); save(); renderAll(); toast('Каталог заменён'); }
    });
    setTimeout(() => {
      const foot = $('#m-confirm .form-foot');
      const add = document.createElement('button');
      add.className = 'btn btn-accent'; add.textContent = 'Добавить к текущим';
      add.onclick = () => {
        closeOv('ov-confirm');
        state.titles.push(...arr.map(t => ({ ...normalizeTitle(t), id: uid() })));
        save(); renderAll(); toast(`Импортировано: ${arr.length} тайтлов`);
      };
      foot.appendChild(add);
    }, 0);
  };
  r.readAsText(f);
  e.target.value = '';
});

/* ================================================================
   НАВИГАЦИЯ, ПАНЕЛЬ, МЕЛОЧИ
   ================================================================ */
let currentView = 'tier';

function movePill() {
  const act = $('.nav-btn.active'), pill = $('#nav-pill');
  if (!act) return;
  pill.style.left = act.offsetLeft + 'px';
  pill.style.top = act.offsetTop + 'px';
  pill.style.width = act.offsetWidth + 'px';
  pill.style.height = act.offsetHeight + 'px';
}

function switchView(name) {
  if (name === 'settings') { toggleDrawer(); return; }
  closeDrawer();
  currentView = name;
  $$('.nav-btn').forEach(x => x.classList.toggle('active', x.dataset.view === name));
  $$('.view').forEach(x => x.classList.add('hidden'));
  $('#view-' + name).classList.remove('hidden');
  if (name === 'tier') renderTierlist(true);
  movePill();
  window.scrollTo({ top: 0, behavior: settings.anim && !REDUCED ? 'smooth' : 'auto' });
}

function toggleDrawer() {
  const open = !document.body.classList.contains('drawer-open');
  document.body.classList.toggle('drawer-open', open);
  $$('.nav-btn').forEach(x => x.classList.toggle('active', x.dataset.view === (open ? 'settings' : currentView)));
  movePill();
}

function closeDrawer() {
  if (!document.body.classList.contains('drawer-open')) return;
  document.body.classList.remove('drawer-open');
  $$('.nav-btn').forEach(x => x.classList.toggle('active', x.dataset.view === currentView));
  movePill();
}

$('#drawer-x').addEventListener('click', closeDrawer);
$('#nav').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) switchView(b.dataset.view); });
$$('[data-act="add"]').forEach(b => b.addEventListener('click', () => { if (typeof canEdit === 'function' && canEdit()) openForm(); }));
$('#btn-random').onclick = () => {
  if (!state.titles.length) { toast('Каталог пуст', 'warn'); return; }
  openTitle(state.titles[Math.floor(Math.random() * state.titles.length)].id);
};

document.addEventListener('click', e => {
  const c = e.target.closest('.js-open');
  if (!c) return;
  if (e.target.closest('#ov-day')) { closeOv('ov-day'); setTimeout(() => openTitle(c.dataset.id), 60); }
  else openTitle(c.dataset.id);
});

$('#cal-prev').onclick = () => { calM--; if (calM < 0) { calM = 11; calY--; } renderCalGrid(); };
$('#cal-next').onclick = () => { calM++; if (calM > 11) { calM = 0; calY++; } renderCalGrid(); };
$('#cal-today').onclick = () => { const n = new Date(); calY = n.getFullYear(); calM = n.getMonth(); renderCalGrid(); };
$('#cal-sel-m').addEventListener('change', e => { calM = +e.target.value; renderCalGrid(); });
$('#cal-sel-y').addEventListener('change', e => { calY = +e.target.value; renderCalGrid(); });
$('#cal-mode-grid').onclick = () => { calMode = 'grid'; renderCalendar(); };
$('#cal-mode-list').onclick = () => { calMode = 'list'; renderCalendar(); };

window.addEventListener('scroll', () => { $('#to-top').classList.toggle('show', scrollY > 500); }, { passive: true });
$('#to-top').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

/* объёмный наклон карточек */
let tiltEl = null;
document.addEventListener('pointermove', e => {
  if (!settings.tilt || REDUCED || e.pointerType !== 'mouse' || matchMedia('(hover:none)').matches) return;
  const card = e.target.closest('.card');
  if (tiltEl && tiltEl !== card) { tiltEl.style.transform = ''; tiltEl = null; }
  if (!card) return;
  tiltEl = card;
  const r = card.getBoundingClientRect();
  const dx = (e.clientX - r.left) / r.width - .5;
  const dy = (e.clientY - r.top) / r.height - .5;
  const amp = settings.tiltPower || 8;
  const lift = settings.cardLift ? 5 : 0;
  card.style.transform = `translateY(-${lift}px) perspective(700px) rotateX(${(-dy * amp).toFixed(2)}deg) rotateY(${(dx * amp).toFixed(2)}deg)`;
});
document.addEventListener('pointerleave', e => {
  if (tiltEl && e.target.closest && e.target.closest('.card') === tiltEl) { tiltEl.style.transform = ''; tiltEl = null; }
}, true);
window.addEventListener('blur', () => { if (tiltEl) { tiltEl.style.transform = ''; tiltEl = null; } });
window.addEventListener('resize', movePill);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

/* ================= старт ================= */
document.addEventListener('DOMContentLoaded', () => {
  Particles.init();
  applySettings();
  bindSettings();
  bindSettingsValues();
  renderAll();
  movePill();
  if (typeof updateSyncUI === 'function') updateSyncUI();
  setTimeout(movePill, 400);
  if (typeof connectAndSync === 'function' && typeof sync !== 'undefined' && sync) connectAndSync();
  const tp = new URLSearchParams(location.search).get('title');
  if (tp && findTitle(tp)) setTimeout(() => openTitle(tp), 500);
});
