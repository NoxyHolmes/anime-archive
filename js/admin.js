document.getElementById('btn-github-auth').addEventListener('click', () => {
    const token = localStorage.getItem('github_token') || '';
    const repo = localStorage.getItem('github_repo') || '';
    document.getElementById('github-token').value = token;
    document.getElementById('github-repo').value = repo;
    openModal('modal-github-auth');
});

document.getElementById('btn-save-github-config').addEventListener('click', () => {
    const token = document.getElementById('github-token').value.trim();
    const repo = document.getElementById('github-repo').value.trim();
    if (!token || !repo) { showToast('error', 'Заполните токен и имя репозитория'); return; }
    localStorage.setItem('github_token', token);
    localStorage.setItem('github_repo', repo);
    closeModal('modal-github-auth');
    showToast('success', 'Конфигурация GitHub сохранена');
    syncWithGitHub();
});

async function syncWithGitHub() {
    const token = localStorage.getItem('github_token');
    const repo = localStorage.getItem('github_repo');
    if (!token || !repo) { updateSaveStatus('GitHub не настроен', true); return; }
    updateSaveStatus('Отправка на GitHub...', false, true);
    try {
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/data.json`, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        let sha = '';
        if (getRes.ok) { const getData = await getRes.json(); sha = getData.sha; }
        else if (getRes.status !== 404) throw new Error(`Ошибка GET: ${getRes.status}`);
        const jsonString = JSON.stringify(state.titles, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(jsonString)));
        const body = { message: 'chore: update anime archive data via web admin', content: encodedContent, branch: 'main' };
        if (sha) body.sha = sha;
        const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/data.json`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (putRes.ok || putRes.status === 201) {
            updateSaveStatus('Отправлено на GitHub');
            showToast('success', 'Успешно сохранено в репозиторий!');
        } else {
            const errData = await putRes.json();
            throw new Error(errData.message || `Ошибка PUT: ${putRes.status}`);
        }
    } catch (error) {
        console.error('GitHub Sync Error:', error);
        updateSaveStatus(`Ошибка GitHub: ${error.message}`, true);
        showToast('error', 'Ошибка сохранения на GitHub');
    }
}

document.getElementById('btn-export-json').addEventListener('click', () => {
    const dataStr = JSON.stringify(state.titles, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `anime-archive-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('success', 'Файл скачан');
});

document.getElementById('btn-import-json').addEventListener('click', () => {
    document.getElementById('file-import').click();
});

document.getElementById('file-import').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
                state.titles = importedData;
                saveData(); renderArchive(); renderRecent(); renderHistory();
                if (typeof updateStats === 'function') updateStats();
                showToast('success', 'Данные успешно импортированы');
            } else throw new Error('Неверный формат JSON');
        } catch (err) { showToast('error', 'Ошибка чтения файла: ' + err.message); }
    };
    reader.readAsText(file);
    e.target.value = '';
});
