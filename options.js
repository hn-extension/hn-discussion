document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('site-list');
    const noSitesMsg = document.getElementById('no-sites');

    // Load settings
    chrome.storage.local.get(['hiddenSites'], (result) => {
        const hiddenSites = result.hiddenSites || [];

        if (hiddenSites.length === 0) {
            noSitesMsg.style.display = 'block';
            return;
        }

        hiddenSites.forEach(site => {
            // SAFE DOM CREATION
            const div = document.createElement('div');
            div.className = 'site-item';

            const span = document.createElement('span');
            span.textContent = site; // Safe text insertion

            const btn = document.createElement('button');
            btn.textContent = 'Remove';
            btn.dataset.site = site;

            div.appendChild(span);
            div.appendChild(btn);
            listContainer.appendChild(div);
        });
    });

    // Handle Remove
    listContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const siteToRemove = e.target.dataset.site;

            chrome.storage.local.get(['hiddenSites'], (result) => {
                let hiddenSites = result.hiddenSites || [];
                hiddenSites = hiddenSites.filter(s => s !== siteToRemove);

                chrome.storage.local.set({ hiddenSites: hiddenSites }, () => {
                    const item = e.target.closest('.site-item');
                    if (item) item.remove();

                    if (hiddenSites.length === 0) {
                        noSitesMsg.style.display = 'block';
                    }
                });
            });
        }
    });
});