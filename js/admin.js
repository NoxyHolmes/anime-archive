'use strict';
/* ================================================================
   СИНХРОНИЗАЦИЯ С GITHUB + НОВАЯ СИСТЕМА ВХОДА ВЛАДЕЛЬЦА
   ================================================================ */

const DATA_PATH = 'anime-data.json';
const LS_KEY = 'anime.v3';
const LS_SET = 'anime.settings';
const LS_BG = 'anime.bg';
const LS_SYNC = 'anime.sync';
const LS_ACCESS = 'anime_access_token';
const LS_OWNER = 'anime_owner_mode';
const POLL_MS = 5000;
const API_MS = 70000;

let sync = null;
try { sync = JSON.parse(localStorage.getItem(LS_SYNC)) || null; } catch (e) {}

let syncStatus = 'off';
let lastSyncAt = 0;
let pushTimer = null;
let pollTimer = null;
let lastSeenSha = null;
let lastApiCheck = 0;
let apiFailStreak = 0;

/* ---- утилиты ---- */
const b64encode = str => {
  const b = new TextEncoder().encode(str);
  let s = '';
  b.forEach(x => s += String.fromCharCode(x));
  return btoa(s);
};

function canEdit() { 
  // Проверяем флаг владельца из localStorage (устанавливается только через admin.html)
  const isOwner = localStorage.getItem(LS_OWNER) === 'true';
  return !!(sync && sync.mode === 'rw' && isOwner); 
}

function saveSync() {
  if (sync) localStorage.setItem(LS_SYNC, JSON.stringify(sync));
  else localStorage.removeItem(LS_SYNC);
}

function rawURL() { return `https://raw.githubusercontent.com/${sync.owner}/${sync.repo}/${sync.branch}/${DATA_PATH}`; }
function shaURL(sha) { return `https://raw.githubusercontent.com/${sync.owner}/${sync.repo}/${sha}/${DATA_PATH}`; }

async function gh(path, token, opts = {}) {
  const h = { 'Accept': 'application/vnd.github+json', ...opts.headers };
  if (token) h.Authorization = 'Bearer ' + token;
  const r = await fetch('https://api.github.com' + path, { ...opts, headers: h });
  if (!r.ok) {
    let msg = 'HTTP ' + r.status;
    try { const j = await r.json(); msg = j.message || msg; } catch (e) {}
    throw { status: r.status, message: msg };
  }
  return r.status === 204 ? null : r.json();
}

/* ---- статус синхронизации ---- */
function setSyncStatus(st) {
  syncStatus = st;
  const dot = document.getElementById('su-dot');
  if (dot) dot.className = 'sync-dot ' + (st === 'ok' ? 'ok' : st === 'sync' ? 'sync' : st === 'err' ? 'err' : '');
  renderSyncMenu();
}

function renderSyncMenu() {
  const m = document.getElementById('sync-menu');
  if (!sync) { m.classList.add('hidden'); return; }
  const mode = sync.mode === 'rw' ? 'владелец · чтение и запись' : 'чтение';
  m.innerHTML = `
    <div class="sm-head"><b>${esc(sync.login || sync.owner)}</b><br>${esc(sync.owner)}/${esc(sync.repo)} · ${mode}</div>
    <button id="sm-sync">Синхронизировать сейчас</button>
    <button id="sm-logout" class="sm-logout">Выйти из режима владельца</button>
    <div class="sm-last">${lastSyncAt ? 'обновлено: ' + new Date(lastSyncAt).toLocaleTimeString('ru-RU') : 'ещё не синхронизировалось'}</div>`;
  document.getElementById('sm-sync').onclick = async () => {
    m.classList.add('hidden');
    lastApiCheck = 0;
    if (sync.mode === 'rw') { await push(); await pull(false); }
    else await pull(false);
  };
  document.getElementById('sm-logout').onclick = () => {
    // Убираем только флаг владельца, но оставляем синхронизацию
    localStorage.removeItem(LS_OWNER);
    setSyncStatus('off');
    updateSyncUI();
    toast('Вы вышли из режима владельца');
    // Перезагружаем страницу через 1 секунду
    setTimeout(() => location.reload(), 1000);
  };
}

function updateSyncUI() {
  const connected = !!sync;
  // Кнопка входа убрана — показываем только статус синхронизации
  document.getElementById('sync-user').classList.toggle('hidden', !connected);
  if (connected) {
    const av = document.getElementById('su-avatar'), mini = document.getElementById('su-ghmini');
    if (sync.avatar) { av.src = sync.avatar; av.classList.remove('hidden'); mini.classList.add('hidden'); }
    else { av.classList.add('hidden'); mini.classList.remove('hidden'); }
  }
  const editable = canEdit();
  document.getElementById('btn-add').classList.toggle('hidden', !editable);
  document.querySelectorAll('[data-act="add"]').forEach(b => b.classList.toggle('hidden', !editable));
  setSyncStatus(sync ? syncStatus : 'off');
}

document.getElementById('sync-user').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('sync-menu').classList.toggle('hidden');
});
document.addEventListener('click', e => {
  if (!e.target.closest('.sync-wrap')) document.getElementById('sync-menu').classList.add('hidden');
});

/* ---- pull / push ---- */
async function pull(silent = true) {
  if (!sync) return;
  setSyncStatus('sync');
  try {
    let url = rawURL(), gotSha = null;
    const due = Date.now() - lastApiCheck > API_MS * Math.max(1, apiFailStreak * 2);
    if (due) {
      lastApiCheck = Date.now();
      try {
        const cs = await gh(`/repos/${sync.owner}/${sync.repo}/commits?path=${encodeURIComponent(DATA_PATH)}&sha=${sync.branch}&per_page=1`, sync.token || '');
        if (Array.isArray(cs) && cs.length) {
          const sha = cs[0].sha;
          gotSha = sha;
          if (sha === lastSeenSha) { lastSyncAt = Date.now(); setSyncStatus('ok'); return; }
          url = shaURL(sha);
        }
      } catch (e) {
        if (e.status === 403 || e.status === 429) apiFailStreak++;
        else apiFailStreak = Math.max(0, apiFailStreak - 1);
      }
    }
    const r = await fetch(url + '?t=' + Date.now(), { cache: 'no-store' });
    if (r.status === 404) { setSyncStatus('err'); if (!silent) toast('Данные не найдены', 'warn'); return; }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const remote = await r.json();
    if (gotSha) lastSeenSha = gotSha;
    lastSyncAt = Date.now();
    if (Array.isArray(remote.titles) && (remote.updatedAt || 0) > (state.updatedAt || 0)) {
      const before = state.titles.length;
      state.titles = remote.titles.map(normalizeTitle);
      state.updatedAt = remote.updatedAt;
      persist(); broadcastLocal();
      renderAll();
      toast(`Каталог обновлён${remote.titles.length !== before ? ` · ${remote.titles.length} ${plural(remote.titles.length, 'тайтл', 'тайтла', 'тайтлов')}` : ''}`);
    }
    setSyncStatus('ok');
  } catch (err) {
    setSyncStatus('err');
    if (!silent) toast('Не удалось получить данные: ' + (err.message || err), 'warn');
  }
}

async function push() {
  if (!sync || sync.mode !== 'rw') return;
  setSyncStatus('sync');
  try {
    let sha = null;
    try {
      const cur = await gh(`/repos/${sync.owner}/${sync.repo}/contents/${DATA_PATH}?ref=${sync.branch}`, sync.token);
      if (cur && cur.sha) sha = cur.sha;
    } catch (e) { if (e.status !== 404) throw e; }
    const payload = { v: 3, updatedAt: state.updatedAt || Date.now(), titles: state.titles };
    const content = b64encode(JSON.stringify(payload));
    if (content.length > 20 * 1024 * 1024) throw { message: 'файл данных слишком большой — уменьшите обложки-файлы' };
    const res = await gh(`/repos/${sync.owner}/${sync.repo}/contents/${DATA_PATH}`, sync.token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ANIME: обновление каталога', content, sha, branch: sync.branch })
    });
    if (res && res.commit && res.commit.sha) lastSeenSha = res.commit.sha;
    lastSyncAt = Date.now();
    setSyncStatus('ok');
  } catch (err) {
    setSyncStatus('err');
    toast('Не удалось отправить данные: ' + (err.message || 'ошибка сети'), 'warn');
  }
}

function schedulePush() {
  if (!sync || sync.mode !== 'rw') return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 1200);
}

async function connectAndSync() {
  updateSyncUI();
  lastSyncAt = 0;
  await pull(true);
  if (sync.mode === 'rw' && syncStatus === 'err') { await push(); await pull(true); }
  if (syncStatus === 'ok') toast('Подключено');
  clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    if (sync && document.visibilityState === 'visible') pull(true);
  }, POLL_MS);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && sync) {
    if (Date.now() - lastSyncAt > 60000) lastApiCheck = 0;
    pull(true);
  }
});
