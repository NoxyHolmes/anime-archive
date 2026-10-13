const state = {
    titles: [],
    settings: {
        theme: 'dark', accent: '#a855f7', viewMode: 'grid', columns: 8,
        particles: { preset: 'sakura', density: 50, speed: 3, size: 8, enabled: true },
        defaultEpTime: 24, defaultMovieTime: 110
    },
    filters: { search: '', tier: 'all', type: 'all', favorite: false },
    isOwner: false
};

const TIERS = ['SSS', 'S', 'A', 'B', 'C', 'D', 'E'];
const GENRES_LIST = [
    "Экшен/Боевик", "Приключения", "Комедия", "Гэг-юмор", "Пародия", "Драма", "Фэнтези",
    "Тёмное фэнтези", "Ужасы", "Мистика", "Триллер", "Саспенс", "Психологическое", "Романтика",
    "Романтическая комедия", "Научная фантастика", "Киберпанк", "Постапокалиптика", "Дистопия",
    "Стимпанк", "Меха", "Космос", "Повседневность", "Спорт", "Сверхъестественное", "Вампиры",
    "Зомби", "Демоны", "Ангелы", "Мифология", "Магия", "Сверхспособности", "Военное", "Полиция",
    "Детектив", "Расследование", "Самураи", "Ниндзя", "Боевые искусства", "Историческое", "Исекай",
    "Обратный исекай", "Путешествия во времени", "Гарем", "Обратный гарем", "Этти", "Школа",
    "Университет", "Офис/Работа", "Медицина", "Кулинария", "Музыка", "Идолы", "Танцы", "Театр",
    "Игра", "Видеоигры", "Настольные игры", "Карты", "Гэмблинг", "Стратегия", "Гонки", "Авто/Мото",
    "Выживание", "Природа/Экология", "Животные", "ИИ и роботы", "Виртуальная реальность", "Сёнэн",
    "Сёдзё", "Сэйнэн", "Дзёсэй", "Сёнэн-ай", "Сёдзё-ай", "Авангард", "Детское", "Семейное"
].sort();

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    checkOwnerMode();
    loadData();
    setupEventListeners();
    applySettings();
});

function loadSettings() {
    const saved = localStorage.getItem('animeArchive_settings');
    if (saved) state.settings = { ...state.settings, ...JSON.parse(saved) };
}

function checkOwnerMode() {
    state.isOwner = localStorage.getItem('animeArchive_ownerMode') === 'true';
    if (state.isOwner) {
        document.querySelectorAll('.owner-only, #btn-add-title, #btn-github-auth, #btn-logout').forEach(el => el.classList.remove('hidden'));
        document.getElementById('owner-badge').classList.remove('hidden');
    }
}

async function loadData() {
    showToast('info', 'Загрузка данных...');
    try {
        const response = await fetch('data.json');
        if (response.ok) {
            const jsonTitles = await response.json();
            const localData = localStorage.getItem('animeArchive_localData');
            state.titles = localData ? JSON.parse(localData) : jsonTitles;
        } else throw new Error('Файл data.json не найден');
    } catch (error) {
        console.warn('Ошибка загрузки data.json', error);
        const localData = localStorage.getItem('animeArchive_localData');
        state.titles = localData ? JSON.parse(localData) : [];
    }
    renderArchive();
    renderRecent();
    if (typeof updateStats === 'function') updateStats();
    showToast('success', 'Данные загружены');
}

function renderArchiveStats() {
    const container = document.getElementById('archive-stats-container');
    if (!container) return;
    let totalTitles = state.titles.length, totalEpisodes = 0, totalMovies = 0, totalTimeMinutes = 0, favorites = 0;
    state.titles.forEach(title => {
        if (title.favorite) favorites++;
        title.entries.forEach(entry => {
            let eps = entry.episodes || 0;
            totalEpisodes += eps;
            if (entry.kind.toLowerCase().includes('фильм') || title.type === 'Фильм') totalMovies++;
            let time = 0;
            if (entry.durationMinutes) time = entry.durationMinutes;
            else if (entry.minutesPerEpisode) time = eps * entry.minutesPerEpisode;
            else {
                const isMovie = entry.kind.toLowerCase().includes('фильм') || title.type === 'Фильм';
                time = eps * (isMovie ? state.settings.defaultMovieTime : state.settings.defaultEpTime);
            }
            totalTimeMinutes += time;
        });
    });
    const hours = Math.floor(totalTimeMinutes / 60);
    const days = Math.floor(hours / 24);
    container.innerHTML = `
        <div class="archive-stat-card"><div class="archive-stat-value">${totalTitles}</div><div class="archive-stat-label">Тайтлов</div></div>
        <div class="archive-stat-card"><div class="archive-stat-value">${totalEpisodes}</div><div class="archive-stat-label">Серий</div></div>
        <div class="archive-stat-card"><div class="archive-stat-value">${totalMovies}</div><div class="archive-stat-label">Фильмов</div></div>
        <div class="archive-stat-card"><div class="archive-stat-value">${hours}ч</div><div class="archive-stat-label">Время</div></div>
        <div class="archive-stat-card"><div class="archive-stat-value">${days}д</div><div class="archive-stat-label">Дней</div></div>
        <div class="archive-stat-card"><div class="archive-stat-value">${favorites}</div><div class="archive-stat-label">Избранных</div></div>
    `;
}

function renderTierDistribution() {
    const container = document.getElementById('tier-distribution');
    if (!container) return;
    const totalTitles = state.titles.length;
    const tierCounts = { 'SSS': 0, 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 };
    state.titles.forEach(title => { tierCounts[title.tier] = (tierCounts[title.tier] || 0) + 1; });
    const tierColors = {
        'SSS': '#ffd700', 'S': '#ff6b00', 'A': '#ff2a2a',
        'B': '#00e676', 'C': '#00bfff', 'D': '#9c27b0', 'E': '#ff0055'
    };
    container.innerHTML = TIERS.map(tier => {
        const count = tierCounts[tier];
        const percent = totalTitles > 0 ? Math.round((count / totalTitles) * 100) : 0;
        const color = tierColors[tier];
        return `
            <div class="tier-dist-item" style="--tier-color: ${color}">
                <div class="tier-dist-header">
                    <div class="tier-dist-letter">${tier}</div>
                    <div class="tier-dist-count">${count}</div>
                </div>
                <div class="tier-dist-bar">
                    <div class="tier-dist-fill" style="width: ${percent}%"></div>
                </div>
                <div class="tier-dist-percent">${percent}%</div>
            </div>
        `;
    }).join('');
}

function renderArchive() {
    renderArchiveStats();
    renderTierDistribution();
    const container = document.getElementById('tiers-container');
    container.innerHTML = '';
    TIERS.forEach(tier => {
        let filtered = state.titles.filter(t => t.tier === tier);
        if (state.filters.tier !== 'all' && state.filters.tier !== tier) filtered = [];
        if (state.filters.type !== 'all') filtered = filtered.filter(t => t.type === state.filters.type);
        if (state.filters.favorite) filtered = filtered.filter(t => t.favorite);
        if (state.filters.search) {
            const q = state.filters.search.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.titleOriginal.toLowerCase().includes(q) ||
                t.genres.some(g => g.toLowerCase().includes(q))
            );
        }
        if (filtered.length === 0 && state.filters.tier === 'all' && state.filters.type === 'all' && !state.filters.favorite && !state.filters.search) return;
        const totalInTier = state.titles.filter(t => t.tier === tier).length;
        const percent = state.titles.length > 0 ? Math.round((totalInTier / state.titles.length) * 100) : 0;
        const section = document.createElement('div');
        section.className = 'tier-section';
        section.dataset.tier = tier;
        section.innerHTML = `
            <div class="tier-header">
                <div class="tier-3d-letter letter-${tier.toLowerCase()}">${tier}</div>
                <div class="tier-stats">${totalInTier} тайтлов (${percent}%)</div>
            </div>
            <div class="tier-grid" id="grid-${tier}" data-tier="${tier}"></div>
        `;
        container.appendChild(section);
        const grid = section.querySelector(`#grid-${tier}`);
        filtered.forEach(title => grid.appendChild(createCard(title)));
        initSortable(grid);
    });
}

function createCard(title) {
    const div = document.createElement('div');
    div.className = 'anime-card';
    div.dataset.id = title.id;
    div.onclick = () => openDetailModal(title.id);
    const totalTime = calculateTitleTime(title);
    const totalEps = title.entries.reduce((sum, e) => sum + (e.episodes || 0), 0);
    const movieCount = title.entries.filter(e => e.kind.toLowerCase().includes('фильм') || title.type === 'Фильм').length;
    const timeStr = totalTime > 0 ? `${Math.round(totalTime / 60)}ч` : '0ч';
    div.innerHTML = `
        <div class="card-cover-wrapper">
            <img src="${title.cover || 'https://via.placeholder.com/300x420?text=No+Cover'}"
                 alt="${title.title}" class="card-cover" loading="lazy"
                 onerror="this.src='https://via.placeholder.com/300x420?text=Error'">
            <div class="card-badges">
                ${title.tier === 'SSS' ? '<i class="fa-solid fa-crown badge-crown"></i>' : ''}
                ${title.favorite ? '<i class="fa-solid fa-heart badge-fav"></i>' : ''}
            </div>
        </div>
        <div class="card-info">
            <div class="card-title">${title.title}</div>
            <div class="card-meta">
                <div class="card-meta-row"><span>${title.type}</span><span>${totalEps} сер.</span></div>
                <div class="card-meta-row"><span>${movieCount} фил.</span><span>${timeStr}</span></div>
            </div>
        </div>
    `;
    return div;
}

function renderRecent() {
    const container = document.getElementById('recent-list');
    container.innerHTML = '';
    const recent = [...state.titles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
    recent.forEach(title => {
        const div = document.createElement('div');
        div.className = 'recent-item';
        div.onclick = () => openDetailModal(title.id);
        div.innerHTML = `
            <img src="${title.cover || 'https://via.placeholder.com/80x110?text=No'}" alt="${title.title}" onerror="this.src='https://via.placeholder.com/80x110?text=Err'">
            <span>${title.title}</span>
        `;
        container.appendChild(div);
    });
}

function initSortable(gridElement) {
    new Sortable(gridElement, {
        group: 'tiers', animation: 200, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag',
        delayOnTouchOnly: true, touchStartThreshold: 5,
        onEnd: function (evt) {
            if (!state.isOwner) { showToast('error', 'Только владелец может менять порядок'); renderArchive(); return; }
            const itemId = evt.item.dataset.id;
            const newTier = evt.to.dataset.tier;
            const title = state.titles.find(t => t.id === itemId);
            if (title && title.tier !== newTier) {
                title.tier = newTier; saveData();
                showToast('success', `Тир изменён на ${newTier}`);
                renderArchive();
            }
        }
    });
}

function calculateTitleTime(title) {
    let total = 0;
    title.entries.forEach(entry => {
        if (entry.durationMinutes) total += entry.durationMinutes;
        else if (entry.episodes && entry.minutesPerEpisode) total += entry.episodes * entry.minutesPerEpisode;
        else if (entry.episodes) {
            const isMovie = entry.kind.toLowerCase().includes('фильм') || title.type === 'Фильм';
            total += entry.episodes * (isMovie ? state.settings.defaultMovieTime : state.settings.defaultEpTime);
        }
    });
    return total;
}

function openDetailModal(id) {
    const title = state.titles.find(t => t.id === id);
    if (!title) return;
    document.getElementById('detail-cover').src = title.cover || 'https://via.placeholder.com/220x310';
    document.getElementById('detail-title').textContent = title.title;
    document.getElementById('detail-original').textContent = title.titleOriginal;
    document.getElementById('detail-type').textContent = title.type;
    const tierBadge = document.getElementById('detail-tier');
    tierBadge.textContent = title.tier;
    tierBadge.style.background = 'var(--accent)';
    document.getElementById('detail-fav').classList.toggle('hidden', !title.favorite);
    document.getElementById('detail-genres').innerHTML = title.genres.map(g => `<span class="genre-tag">${g}</span>`).join('');
    const tbody = document.getElementById('detail-entries-body');
    tbody.innerHTML = '';
    let totalTime = 0;
    title.entries.forEach(entry => {
        let time = 0;
        if (entry.durationMinutes) time = entry.durationMinutes;
        else if (entry.episodes && entry.minutesPerEpisode) time = entry.episodes * entry.minutesPerEpisode;
        else {
            const isMovie = entry.kind.toLowerCase().includes('фильм') || title.type === 'Фильм';
            time = entry.episodes * (isMovie ? state.settings.defaultMovieTime : state.settings.defaultEpTime);
        }
        totalTime += time;
        const timeStr = time >= 60 ? `${Math.floor(time/60)} ч ${time%60} мин` : `${time} мин`;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${entry.kind}</td><td>${entry.episodes || '-'}</td><td>${entry.minutesPerEpisode ? entry.minutesPerEpisode + ' мин' : (entry.durationMinutes ? entry.durationMinutes + ' мин' : 'Стандарт')}</td><td>${entry.watchDate}</td><td>${timeStr}</td>`;
        tbody.appendChild(tr);
    });
    document.getElementById('detail-total-time').textContent = totalTime >= 60 ? `${Math.floor(totalTime/60)} ч ${totalTime%60} мин` : `${totalTime} мин`;
    document.querySelector('.detail-actions').classList.toggle('hidden', !state.isOwner);
    document.getElementById('btn-edit-title').onclick = () => { closeModal('modal-title-detail'); openFormModal(title); };
    document.getElementById('btn-delete-title').onclick = () => {
        if (confirm(`Удалить "${title.title}"?`)) {
            state.titles = state.titles.filter(t => t.id !== id);
            saveData(); closeModal('modal-title-detail');
            renderArchive(); renderRecent();
            if (typeof updateStats === 'function') updateStats();
            showToast('success', 'Тайтл удалён');
        }
    };
    openModal('modal-title-detail');
}

let currentFormGenres = [];
function openFormModal(title = null) {
    const form = document.getElementById('title-form');
    form.reset(); currentFormGenres = [];
    document.getElementById('form-entries-container').innerHTML = '';
    document.getElementById('form-modal-title').textContent = title ? 'Редактировать тайтл' : 'Добавить тайтл';
    if (title) {
        document.getElementById('form-id').value = title.id;
        document.getElementById('form-title').value = title.title;
        document.getElementById('form-title-original').value = title.titleOriginal;
        document.getElementById('form-type').value = title.type;
        document.getElementById('form-tier').value = title.tier;
        document.getElementById('form-cover').value = title.cover;
        document.getElementById('form-favorite').checked = title.favorite;
        currentFormGenres = [...title.genres];
        title.entries.forEach(entry => addEntryRow(entry));
    } else {
        document.getElementById('form-id').value = crypto.randomUUID();
        addEntryRow({ kind: 'TV-сериал', episodes: 12, minutesPerEpisode: 24, watchDate: '' });
    }
    renderSelectedGenres();
    openModal('modal-title-form');
}

function addEntryRow(data = {}) {
    const container = document.getElementById('form-entries-container');
    const div = document.createElement('div');
    div.className = 'entry-row';
    div.innerHTML = `
        <input type="text" placeholder="Название части" class="entry-kind" value="${data.kind || ''}" required>
        <input type="number" placeholder="Серий" class="entry-ep" value="${data.episodes || ''}">
        <input type="number" placeholder="Мин/серия" class="entry-min" value="${data.minutesPerEpisode || ''}">
        <input type="text" placeholder="Дата" class="entry-date" value="${data.watchDate || ''}">
        <button type="button" class="btn-remove-entry" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(div);
}

function renderSelectedGenres() {
    document.getElementById('form-genres-selected').innerHTML = currentFormGenres.map(g =>
        `<span class="selected-tag">${g} <i class="fa-solid fa-xmark" onclick="removeGenre('${g}')"></i></span>`
    ).join('');
}
window.removeGenre = function(genre) {
    currentFormGenres = currentFormGenres.filter(g => g !== genre);
    renderSelectedGenres();
};

document.getElementById('title-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.isOwner) { showToast('error', 'Нет прав для сохранения'); return; }
    const id = document.getElementById('form-id').value;
    const isNew = !state.titles.find(t => t.id === id);
    const entries = [];
    document.querySelectorAll('.entry-row').forEach(row => {
        const kind = row.querySelector('.entry-kind').value;
        const episodes = parseInt(row.querySelector('.entry-ep').value) || 0;
        const minutesPerEpisode = parseInt(row.querySelector('.entry-min').value) || null;
        const watchDate = row.querySelector('.entry-date').value;
        if (kind) entries.push({ kind, episodes, minutesPerEpisode, durationMinutes: null, watchDate });
    });
    const titleData = {
        id, title: document.getElementById('form-title').value,
        titleOriginal: document.getElementById('form-title-original').value,
        type: document.getElementById('form-type').value,
        tier: document.getElementById('form-tier').value,
        cover: document.getElementById('form-cover').value,
        favorite: document.getElementById('form-favorite').checked,
        genres: currentFormGenres, entries,
        createdAt: isNew ? new Date().toISOString().split('T')[0] : state.titles.find(t => t.id === id).createdAt
    };
    if (isNew) state.titles.push(titleData);
    else { const index = state.titles.findIndex(t => t.id === id); state.titles[index] = titleData; }
    saveData(); closeModal('modal-title-form');
    renderArchive(); renderRecent();
    if (typeof updateStats === 'function') updateStats();
    showToast('success', 'Тайтл сохранён');
});

let saveTimeout;
function saveData() {
    localStorage.setItem('animeArchive_localData', JSON.stringify(state.titles));
    updateSaveStatus('Локально сохранено');
    if (state.isOwner) {
        clearTimeout(saveTimeout);
        updateSaveStatus('Синхронизация...', false, true);
        saveTimeout = setTimeout(() => { if (typeof syncWithGitHub === 'function') syncWithGitHub(); }, 1500);
    }
}

function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
}
function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('active');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function showToast(type, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'exclamation-circle' : 'info-circle');
    toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function updateSaveStatus(text, isError = false, isSyncing = false) {
    const el = document.getElementById('save-status')?.querySelector('.status-indicator');
    if (!el) return;
    el.textContent = `Статус: ${text}`;
    el.className = 'status-indicator';
    if (isError) el.classList.add('error');
    if (isSyncing) el.classList.add('syncing');
}

function applySettings() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    document.documentElement.style.setProperty('--accent', state.settings.accent);
    document.documentElement.style.setProperty('--grid-columns', state.settings.columns);
    if (window.particleSystem) window.particleSystem.updateConfig(state.settings.particles);
}

function setupEventListeners() {
    const searchInput = document.getElementById('global-search');
    const searchBox = searchInput.parentElement;
    let clearBtn = searchBox.querySelector('.fa-times');
    if (!clearBtn) {
        clearBtn = document.createElement('i');
        clearBtn.className = 'fa-solid fa-times';
        searchBox.appendChild(clearBtn);
    }
    searchInput.addEventListener('input', (e) => {
        clearBtn.style.display = e.target.value ? 'block' : 'none';
        state.filters.search = e.target.value;
        renderArchive();
    });
    clearBtn.addEventListener('click', () => {
        searchInput.value = ''; clearBtn.style.display = 'none';
        state.filters.search = ''; renderArchive(); searchInput.focus();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            if (btn.dataset.tab === 'stats' && typeof updateStats === 'function') updateStats();
            if (btn.dataset.tab === 'calendar' && typeof renderCalendar === 'function') renderCalendar();
        });
    });

    ['filter-tier', 'filter-type', 'filter-favorite'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            state.filters.tier = document.getElementById('filter-tier').value;
            state.filters.type = document.getElementById('filter-type').value;
            state.filters.favorite = document.getElementById('filter-favorite').checked;
            renderArchive();
        });
    });

    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            closeModal(modal.id);
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
    });

    document.getElementById('btn-add-entry').addEventListener('click', () => addEntryRow());

    const genreSearch = document.getElementById('form-genres-search');
    const genreDropdown = document.getElementById('form-genres-dropdown');
    const datalist = document.getElementById('genre-datalist');
    datalist.innerHTML = GENRES_LIST.map(g => `<option value="${g}">`).join('');
    genreSearch.setAttribute('list', 'genre-datalist');
    genreSearch.addEventListener('input', () => {
        const val = genreSearch.value.toLowerCase();
        const filtered = GENRES_LIST.filter(g => g.toLowerCase().includes(val) && !currentFormGenres.includes(g));
        genreDropdown.innerHTML = filtered.map(g => `<div class="genre-option" onclick="addGenreToForm('${g}')">${g}</div>`).join('');
        genreDropdown.classList.toggle('hidden', filtered.length === 0);
    });
    genreSearch.addEventListener('focus', () => {
        if (genreSearch.value === '') {
            const filtered = GENRES_LIST.filter(g => !currentFormGenres.includes(g));
            genreDropdown.innerHTML = filtered.slice(0, 10).map(g => `<div class="genre-option" onclick="addGenreToForm('${g}')">${g}</div>`).join('');
            genreDropdown.classList.remove('hidden');
        }
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.multi-select-container')) genreDropdown.classList.add('hidden');
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
        document.querySelector('.tab-btn[data-tab="settings"]').click();
    });

    document.getElementById('set-theme').addEventListener('change', (e) => { state.settings.theme = e.target.value; saveSettings(); });
    document.getElementById('set-accent').addEventListener('input', (e) => { state.settings.accent = e.target.value; saveSettings(); });
    document.getElementById('set-view-mode').addEventListener('change', (e) => { state.settings.viewMode = e.target.value; saveSettings(); });
    document.getElementById('set-columns').addEventListener('input', (e) => {
        state.settings.columns = e.target.value;
        document.getElementById('set-columns-val').textContent = e.target.value;
        saveSettings();
    });
    ['preset', 'density', 'speed', 'size'].forEach(key => {
        document.getElementById(`set-particle-${key}`).addEventListener('change', (e) => {
            state.settings.particles[key] = key === 'preset' ? e.target.value : parseInt(e.target.value);
            saveSettings();
        });
    });
    document.getElementById('set-anim-enabled').addEventListener('change', (e) => {
        state.settings.particles.enabled = e.target.checked; saveSettings();
    });
    document.getElementById('set-default-ep-time').addEventListener('change', (e) => { state.settings.defaultEpTime = parseInt(e.target.value); saveSettings(); });
    document.getElementById('set-default-movie-time').addEventListener('change', (e) => { state.settings.defaultMovieTime = parseInt(e.target.value); saveSettings(); });
    document.getElementById('btn-logout').addEventListener('click', () => { localStorage.removeItem('animeArchive_ownerMode'); location.reload(); });
}

window.addGenreToForm = function(genre) {
    if (!currentFormGenres.includes(genre)) {
        currentFormGenres.push(genre); renderSelectedGenres();
        document.getElementById('form-genres-search').value = '';
        document.getElementById('form-genres-dropdown').classList.add('hidden');
    }
};

function saveSettings() {
    localStorage.setItem('animeArchive_settings', JSON.stringify(state.settings));
    applySettings();
}
