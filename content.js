(function() {
    'use strict';

    console.log("HN Sidebar: Extension script initiated.");

    try {
        // -- 1. Create Floating Button UI --
        const hoverArea = document.createElement('div');
        hoverArea.id = 'hn-hover-area';

        const iconWrapper = document.createElement('div');
        iconWrapper.id = 'hn-sidebar-wrapper';

        const button = document.createElement('button');
        button.id = 'hn-sidebar-button';
        button.innerHTML = 'Y';

        const hideHandle = document.createElement('div');
        hideHandle.id = 'hn-sidebar-hide-handle';
        hideHandle.innerHTML = '&times;';
        hideHandle.title = "Hide on this site";

        const searchControls = document.createElement('div');
        searchControls.id = 'hn-search-controls';
        searchControls.innerHTML = `<button class="hn-search-btn" data-search-type="domain">Domain</button><button class="hn-search-btn" data-search-type="path">Full Path</button>`;

        iconWrapper.append(searchControls, button, hideHandle);
        hoverArea.appendChild(iconWrapper);
        document.body.appendChild(hoverArea);

        console.log("HN Sidebar: Button added to page.");

        // -- 2. Create Sidebar UI --
        const sidebar = document.createElement('div');
        sidebar.id = 'hn-sidebar-container';
        sidebar.innerHTML = `
            <div id="hn-sidebar-header"><h2>Hacker News Discussion</h2><button id="hn-sidebar-close-btn" title="Close">&times;</button></div>
            <div id="hn-sidebar-content"></div>
        `;
        document.body.appendChild(sidebar);

        // -- CHECK STORAGE FOR HIDDEN SETTINGS --
        const currentDomain = window.location.hostname;

        chrome.storage.local.get(['hiddenSites'], (result) => {
            const hiddenSites = result.hiddenSites || [];
            console.log("HN Sidebar: Loaded hidden sites list:", hiddenSites);

            if (hiddenSites.includes(currentDomain)) {
                hoverArea.style.display = 'none';
                console.log(`HN Sidebar: Hidden on ${currentDomain} by user preference.`);
            }
        });

        const contentArea = sidebar.querySelector('#hn-sidebar-content');
        let hasFetched = false;

        // -- 3. Helper Functions --

        const apiFetch = (url) => {
            console.log("HN Sidebar: Fetching URL...", url);
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({ action: 'fetchHN', url: url }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("HN Sidebar: Runtime error", chrome.runtime.lastError);
                        reject(chrome.runtime.lastError.message);
                        return;
                    }
                    if (response && response.success) {
                        resolve(response.data);
                    } else {
                        console.error("HN Sidebar: Fetch failed", response);
                        reject(response ? response.error : 'Unknown error');
                    }
                });
            });
        };

        const renderComments = (comments, parentElement) => {
            if (!comments || comments.length === 0) return;
            comments.forEach(comment => {
                if (!comment.author || !comment.text) return;
                const commentDiv = document.createElement('div');
                commentDiv.className = 'hn-comment';
                const timeAgo = new Date(comment.created_at_i * 1000).toLocaleString();
                commentDiv.innerHTML = `<div class="hn-comment-meta"><strong>${comment.author}</strong> - ${timeAgo}</div><div class="hn-comment-text">${comment.text}</div>`;
                parentElement.appendChild(commentDiv);
                if (comment.children) renderComments(comment.children, commentDiv);
            });
        };

        const fetchStoryById = (storyId) => {
            let storyDisplay = contentArea.querySelector('#hn-story-display');
            if (!storyDisplay) {
                storyDisplay = document.createElement('div');
                storyDisplay.id = 'hn-story-display';
                contentArea.appendChild(storyDisplay);
            }
            storyDisplay.innerHTML = `<div class="hn-loading">Loading story...</div>`;

            apiFetch(`https://hn.algolia.com/api/v1/items/${storyId}`)
                .then(story => {
                    storyDisplay.innerHTML = '';
                    const storyLink = document.createElement('a');
                    storyLink.href = `https://news.ycombinator.com/item?id=${story.id}`;
                    storyLink.target = '_blank';
                    storyLink.innerHTML = `<h3>${story.title}</h3>`;
                    storyDisplay.appendChild(storyLink);
                    renderComments(story.children, storyDisplay);
                })
                .catch((err) => {
                    console.error(err);
                    storyDisplay.innerHTML = '<div class="hn-no-results">Error fetching story details.</div>';
                });
        };

        const renderSubmissionList = (hits) => {
            const selector = document.createElement('details');
            selector.id = 'hn-submission-selector';
            selector.innerHTML = `<summary>${hits.length} discussions found. (Showing latest)</summary>`;
            const list = document.createElement('ul');
            list.id = 'hn-submission-list';

            hits.forEach(hit => {
                const date = new Date(hit.created_at_i * 1000).toLocaleDateString();
                const li = document.createElement('li');
                li.innerHTML = `
                    <button data-story-id="${hit.objectID}">
                        <div class="submission-title">${hit.title}</div>
                        <div class="submission-meta">${hit.points} points | ${hit.num_comments} comments | ${date}</div>
                    </button>
                `;
                list.appendChild(li);
            });
            selector.appendChild(list);
            contentArea.prepend(selector);
        };

        const searchForUrl = (searchUrl, searchTitle) => {
            contentArea.innerHTML = `<div class="hn-loading">Searching for "${searchTitle}"...</div>`;

            apiFetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(searchUrl)}&tags=story`)
                .then(searchResults => {
                    contentArea.innerHTML = '';

                    const pageUrl = encodeURIComponent(window.location.href);
                    const pageTitle = encodeURIComponent(document.title);
                    const submitUrl = `https://news.ycombinator.com/submit?u=${pageUrl}&t=${pageTitle}`;
                    const actionsDiv = document.createElement('div');
                    actionsDiv.id = 'hn-sidebar-actions';
                    actionsDiv.innerHTML = `<a href="${submitUrl}" target="_blank" class="hn-submit-link">Post this URL to HN</a>`;
                    contentArea.appendChild(actionsDiv);

                    if (searchResults.hits.length === 0) {
                        contentArea.insertAdjacentHTML('beforeend', '<div class="hn-no-results">No discussions found.</div>');
                        return;
                    }

                    if (searchResults.hits.length > 1) {
                        renderSubmissionList(searchResults.hits);
                    }

                    fetchStoryById(searchResults.hits[0].objectID);
                })
                .catch((err) => {
                    console.error(err);
                    contentArea.innerHTML = '<div class="hn-no-results">Error searching Algolia.</div>';
                });
        };

        const initiateSearch = (searchType) => {
            const url = (searchType === 'domain') ? window.location.hostname : window.location.href;
            const title = (searchType === 'domain') ? window.location.hostname : 'Full Path';
            sidebar.classList.add('hn-sidebar-visible');
            hasFetched = true;
            searchForUrl(url, title);
        };

        const toggleSidebar = () => {
            const isVisible = sidebar.classList.contains('hn-sidebar-visible');
            if (isVisible) {
                sidebar.classList.remove('hn-sidebar-visible');
            } else {
                sidebar.classList.add('hn-sidebar-visible');
                if (!hasFetched) {
                    initiateSearch('path');
                }
            }
        };

        // -- 4. Event Listeners --

        button.addEventListener('click', toggleSidebar);
        sidebar.querySelector('#hn-sidebar-close-btn').addEventListener('click', toggleSidebar);

        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.action === "toggleSidebar") toggleSidebar();
        });

        hideHandle.addEventListener('click', (e) => {
            e.stopPropagation();
            hoverArea.style.display = 'none';

            const domainToHide = window.location.hostname;
            console.log(`HN Sidebar: Hiding permanently on ${domainToHide}`);

            chrome.storage.local.get(['hiddenSites'], (result) => {
                const hiddenSites = result.hiddenSites || [];
                if (!hiddenSites.includes(domainToHide)) {
                    hiddenSites.push(domainToHide);
                    chrome.storage.local.set({ hiddenSites: hiddenSites }, () => {
                         console.log("HN Sidebar: Preference saved.");
                    });
                }
            });
        });

        searchControls.addEventListener('click', (e) => {
            if (e.target.matches('.hn-search-btn')) {
                const searchType = e.target.getAttribute('data-search-type');
                initiateSearch(searchType);
            }
        });

        contentArea.addEventListener('click', (e) => {
            const targetButton = e.target.closest('button[data-story-id]');
            if (targetButton) {
                const storyId = targetButton.dataset.storyId;
                fetchStoryById(storyId);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.shiftKey && e.key.toUpperCase() === 'H') {
                // If the user forcibly shows it, we just show it temporarily.
                // We do NOT remove it from storage automatically.
                hoverArea.style.display = 'block';
                console.log("HN Sidebar: Temporarily showing button via hotkey.");
            }
        });

        console.log("HN Sidebar: Initialization complete.");

    } catch (e) {
        console.error("HN Sidebar: Critical Error during initialization:", e);
    }
})();