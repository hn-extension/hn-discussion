document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('site-list');
    const noSitesMsg = document.getElementById('no-sites');

    // Load settings from chrome.storage
    chrome.storage.local.get(['hiddenSites'], (result) => {
        const hiddenSites = result.hiddenSites || [];

        if (hiddenSites.length === 0) {
            noSitesMsg.style.display = 'block';
            return;
        }

        hiddenSites.forEach(site => {
            const div = document.createElement('div');
            div.className = 'site-item';
            div.innerHTML = `
                <span>${site}</span>
                <button data-site="${site}">Remove</button>
            `;
            listContainer.appendChild(div);
        });
    });

    // Handle Remove Button Clicks
    listContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const siteToRemove = e.target.getAttribute('data-site');

            chrome.storage.local.get(['hiddenSites'], (result) => {
                let hiddenSites = result.hiddenSites || [];
                hiddenSites = hiddenSites.filter(s => s !== siteToRemove);

                chrome.storage.local.set({ hiddenSites: hiddenSites }, () => {
                    // Remove from UI immediately
                    e.target.closest('.site-item').remove();
                    if (hiddenSites.length === 0) noSitesMsg.style.display = 'block';
                });
            });
        }
    });
});