'use strict';
/* ================================================================
   СИНХРОНИЗАЦИЯ С GITHUB
   · GitHub — источник истины
   · localStorage — быстрый кэш
   · опрос raw каждые 5 секунд (мгновенные обновления)
   · раз в ~70с авторитетная проверка SHA через API
   · возврат во вкладку — немедленный опрос
   ================================================================ */

const DATA_PATH = 'anime-data.json';
const LS_KEY = 'anime.v3';
const LS_SET = 'anime.settings';
const LS_BG = 'anime.bg';
const LS_SYNC = 'anime.sync';
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

function canEdit() { return !!(sync && sync.mode === 'rw'); }
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
    <button id="sm-settings">Настройки подключения</button>
    <button id="sm-logout" class="sm-logout">Отключиться</button>
    <div class="sm-last">${lastSyncAt ? 'обновлено: ' + new Date(lastSyncAt).toLocaleTimeString('ru-RU') : 'ещё не синхронизировалось'}</div>`;
  document.getElementById('sm-sync').onclick = async () => {
    m.classList.add('hidden');
    lastApiCheck = 0;
    if (sync.mode === 'rw') { await push(); await pull(false); }
    else await pull(false);
  };
  document.getElementById('sm-settings').onclick = () => { m.classList.add('hidden'); openLogin(sync.mode); };
  document.getElementById('sm-logout').onclick = () => {
    sync = null; saveSync();
    clearInterval(pollTimer); pollTimer = null;
    setSyncStatus('off'); updateSyncUI(); toast('Вы вышли');
  };
}

function updateSyncUI() {
  const connected = !!sync;
  document.getElementById('btn-login').classList.toggle('hidden', connected);
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

/* ---- модалка входа ---- */
let loginTab = 'rw', checkedToken = '', checkedUser = null;

function openLogin(tab) {
  loginTab = tab || 'rw';
  checkedToken = ''; checkedUser = null;
  document.getElementById('lk-token').value = '';
  document.getElementById('lk-user').classList.add('hidden');
  document.getElementById('lk-repo-w').classList.add('hidden');
  document.getElementById('lk-branch-w').classList.add('hidden');
  document.getElementById('lk-connect').disabled = true;
  document.getElementById('lk-status').textContent = '';
  document.getElementById('ro-status').textContent = '';
  document.querySelectorAll('.login-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === loginTab));
  document.getElementById('lk-rw').classList.toggle('hidden', loginTab !== 'rw');
  document.getElementById('lk-ro').classList.toggle('hidden', loginTab !== 'ro');
  openOv('ov-login');
}

document.querySelectorAll('.login-tabs button').forEach(b => b.addEventListener('click', () => openLogin(b.dataset.tab)));
document.getElementById('btn-login').onclick = () => openLogin('rw');

document.getElementById('lk-check').onclick = async () => {
  const token = document.getElementById('lk-token').value.trim();
  if (!token) { document.getElementById('lk-status').textContent = 'введите токен'; return; }
  document.getElementById('lk-status').textContent = 'проверяю…';
  try {
    const user = await gh('/user', token);
    checkedToken = token;
    checkedUser = user;
    document.getElementById('lk-user').innerHTML = `
      <img src="${esc(user.avatar_url)}" alt="">
      <div><div class="lku-name">${esc(user.login)}</div><div class="lku-sub">${esc(user.name || '')}</div></div>`;
    document.getElementById('lk-user').classList.remove('hidden');
    const repos = await gh('/user/repos?per_page=100&sort=pushed&affiliation=owner', token);
    const pushable = repos.filter(r => r.permissions && r.permissions.push);
    if (!pushable.length) { document.getElementById('lk-status').textContent = 'не найдено репозиториев с правом записи'; return; }
    document.getElementById('lk-repo').innerHTML = pushable.map(r => `<option value="${esc(r.full_name)}">${esc(r.full_name)}</option>`).join('');
    document.getElementById('lk-repo-w').classList.remove('hidden');
    document.getElementById('lk-repo').onchange = loadBranches;
    await loadBranches();
    document.getElementById('lk-connect').disabled = false;
    document.getElementById('lk-status').textContent = 'готово — выберите репозиторий и подключите';
  } catch (err) {
    checkedToken = ''; checkedUser = null;
    document.getElementById('lk-user').classList.add('hidden');
    document.getElementById('lk-repo-w').classList.add('hidden');
    document.getElementById('lk-branch-w').classList.add('hidden');
    document.getElementById('lk-connect').disabled = true;
    document.getElementById('lk-status').textContent = 'ошибка: ' + (err.message || err.status);
  }
};

async function loadBranches() {
  const full = document.getElementById('lk-repo').value;
  if (!full) return;
  try {
    const bs = await gh(`/repos/${full}/branches?per_page=100`, checkedToken);
    document.getElementById('lk-branch').innerHTML = bs.map(b => `<option value="${esc(b.name)}" ${b.name === 'main' || b.name === 'master' ? 'selected' : ''}>${esc(b.name)}</option>`).join('');
    document.getElementById('lk-branch-w').classList.remove('hidden');
  } catch (e) {
    document.getElementById('lk-branch').innerHTML = '<option value="main">main</option>';
    document.getElementById('lk-branch-w').classList.remove('hidden');
  }
}

document.getElementById('lk-connect').onclick = () => {
  if (!checkedUser) return;
  const full = document.getElementById('lk-repo').value;
  const [owner, repo] = full.split('/');
  sync = {
    mode: 'rw', token: checkedToken, owner, repo,
    branch: document.getElementById('lk-branch').value || 'main',
    login: checkedUser.login, avatar: checkedUser.avatar_url
  };
  saveSync();
  closeOv('ov-login');
  connectAndSync();
};

document.getElementById('ro-connect').onclick = async () => {
  const owner = document.getElementById('ro-owner').value.trim(), repo = document.getElementById('ro-repo').value.trim();
  if (!owner || !repo) { document.getElementById('ro-status').textContent = 'укажите владельца и репозиторий'; return; }
  const cfg = { mode: 'ro', token: '', owner, repo, branch: document.getElementById('ro-branch').value.trim() || 'main', login: owner, avatar: '' };
  document.getElementById('ro-status').textContent = 'проверяю доступ…';
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${cfg.branch}/${DATA_PATH}?t=${Date.now()}`, { cache: 'no-store' });
    if (r.status === 404) { document.getElementById('ro-status').textContent = 'данные не найдены — проверьте адрес'; return; }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    sync = cfg; saveSync();
    closeOv('ov-login');
    connectAndSync();
  } catch (err) {
    document.getElementById('ro-status').textContent = 'не удалось подключиться: ' + (err.message || 'репозиторий приватный?');
  }
};

/* ---- ссылка-приглашение ---- */
(function () {
  const qp = new URLSearchParams(location.search).get('repo');
  if (qp && qp.includes('/')) {
    const [o, r] = qp.split('/');
    setTimeout(() => {
      openLogin('ro');
      document.getElementById('ro-owner').value = o;
      document.getElementById('ro-repo').value = r;
      if (qp.get('branch')) document.getElementById('ro-branch').value = qp.get('branch');
    }, 600);
  }
})();
