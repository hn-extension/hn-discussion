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
        button.textContent = 'Y'; // Safe text

        const hideHandle = document.createElement('div');
        hideHandle.id = 'hn-sidebar-hide-handle';
        hideHandle.innerHTML = '&times;'; // Safe: Static entity
        hideHandle.title = "Hide on this site";

        // Safe creation of search controls
        const searchControls = document.createElement('div');
        searchControls.id = 'hn-search-controls';

        const btnDomain = document.createElement('button');
        btnDomain.className = 'hn-search-btn';
        btnDomain.dataset.searchType = 'domain';
        btnDomain.textContent = 'Domain';

        const btnPath = document.createElement('button');
        btnPath.className = 'hn-search-btn';
        btnPath.dataset.searchType = 'path';
        btnPath.textContent = 'Full Path';

        searchControls.append(btnDomain, btnPath);
        iconWrapper.append(searchControls, button, hideHandle);
        hoverArea.appendChild(iconWrapper);
        document.body.appendChild(hoverArea);

        console.log("HN Sidebar: Button added to page.");

        // -- 2. Create Sidebar UI --
        const sidebar = document.createElement('div');
        sidebar.id = 'hn-sidebar-container';

        // Header
        const header = document.createElement('div');
        header.id = 'hn-sidebar-header';

        const headerTitle = document.createElement('h2');
        headerTitle.textContent = 'Hacker News Discussion';

        const closeBtn = document.createElement('button');
        closeBtn.id = 'hn-sidebar-close-btn';
        closeBtn.title = 'Close';
        closeBtn.innerHTML = '&times;'; // Safe: Static entity

        header.append(headerTitle, closeBtn);

        // Content
        const contentDiv = document.createElement('div');
        contentDiv.id = 'hn-sidebar-content';

        sidebar.append(header, contentDiv);
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

                // Meta Row
                const metaDiv = document.createElement('div');
                metaDiv.className = 'hn-comment-meta';

                const authorStrong = document.createElement('strong');
                authorStrong.textContent = comment.author; // SAFE

                const timeAgo = new Date(comment.created_at_i * 1000).toLocaleString();
                const timeText = document.createTextNode(` - ${timeAgo}`);

                metaDiv.append(authorStrong, timeText);

                // Text Row
                const textDiv = document.createElement('div');
                textDiv.className = 'hn-comment-text';

                textDiv.innerHTML = comment.text;

                commentDiv.append(metaDiv, textDiv);
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
            // Clear content safely
            while (storyDisplay.firstChild) {
                storyDisplay.removeChild(storyDisplay.firstChild);
            }

            const loading = document.createElement('div');
            loading.className = 'hn-loading';
            loading.textContent = 'Loading story...';
            storyDisplay.appendChild(loading);

            apiFetch(`https://hn.algolia.com/api/v1/items/${storyId}`)
                .then(story => {
                    // Clear loading
                    storyDisplay.textContent = '';

                    const storyLink = document.createElement('a');
                    storyLink.href = `https://news.ycombinator.com/item?id=${story.id}`;
                    storyLink.target = '_blank';

                    const titleH3 = document.createElement('h3');
                    titleH3.textContent = story.title; // SAFE

                    storyLink.appendChild(titleH3);
                    storyDisplay.appendChild(storyLink);

                    renderComments(story.children, storyDisplay);
                })
                .catch((err) => {
                    console.error(err);
                    storyDisplay.textContent = '';
                    const errDiv = document.createElement('div');
                    errDiv.className = 'hn-no-results';
                    errDiv.textContent = 'Error fetching story details.';
                    storyDisplay.appendChild(errDiv);
                });
        };

        const renderSubmissionList = (hits) => {
            const selector = document.createElement('details');
            selector.id = 'hn-submission-selector';

            const summary = document.createElement('summary');
            summary.textContent = `${hits.length} discussions found. (Showing latest)`;
            selector.appendChild(summary);

            const list = document.createElement('ul');
            list.id = 'hn-submission-list';

            hits.forEach(hit => {
                const date = new Date(hit.created_at_i * 1000).toLocaleDateString();
                const li = document.createElement('li');

                const btn = document.createElement('button');
                btn.dataset.storyId = hit.objectID;

                const titleDiv = document.createElement('div');
                titleDiv.className = 'submission-title';
                titleDiv.textContent = hit.title; // SAFE

                const metaDiv = document.createElement('div');
                metaDiv.className = 'submission-meta';
                metaDiv.textContent = `${hit.points} points | ${hit.num_comments} comments | ${date}`; // SAFE

                btn.append(titleDiv, metaDiv);
                li.appendChild(btn);
                list.appendChild(li);
            });
            selector.appendChild(list);
            contentArea.prepend(selector);
        };

        const searchForUrl = (searchUrl, searchTitle) => {
            // Clear safely
            while (contentArea.firstChild) {
                contentArea.removeChild(contentArea.firstChild);
            }

            const loading = document.createElement('div');
            loading.className = 'hn-loading';
            loading.textContent = `Searching for "${searchTitle}"...`;
            contentArea.appendChild(loading);

            apiFetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(searchUrl)}&tags=story`)
                .then(searchResults => {
                    contentArea.textContent = ''; // Clear loading

                    const pageUrl = encodeURIComponent(window.location.href);
                    const pageTitle = encodeURIComponent(document.title);
                    const submitUrl = `https://news.ycombinator.com/submit?u=${pageUrl}&t=${pageTitle}`;

                    const actionsDiv = document.createElement('div');
                    actionsDiv.id = 'hn-sidebar-actions';

                    const link = document.createElement('a');
                    link.href = submitUrl;
                    link.target = '_blank';
                    link.className = 'hn-submit-link';
                    link.textContent = 'Post this URL to HN';

                    actionsDiv.appendChild(link);
                    contentArea.appendChild(actionsDiv);

                    if (searchResults.hits.length === 0) {
                        const noRes = document.createElement('div');
                        noRes.className = 'hn-no-results';
                        noRes.textContent = 'No discussions found.';
                        contentArea.appendChild(noRes);
                        return;
                    }

                    if (searchResults.hits.length > 1) {
                        renderSubmissionList(searchResults.hits);
                    }

                    fetchStoryById(searchResults.hits[0].objectID);
                })
                .catch((err) => {
                    console.error(err);
                    contentArea.textContent = '';
                    const errDiv = document.createElement('div');
                    errDiv.className = 'hn-no-results';
                    errDiv.textContent = 'Error searching Algolia.';
                    contentArea.appendChild(errDiv);
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
                const searchType = e.target.dataset.searchType;
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
                hoverArea.style.display = 'block';
                console.log("HN Sidebar: Temporarily showing button via hotkey.");
            }
        });

        console.log("HN Sidebar: Initialization complete.");

    } catch (e) {
        console.error("HN Sidebar: Critical Error during initialization:", e);
    }
})();