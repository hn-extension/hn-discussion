chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchHN') {
        fetch(request.url)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => sendResponse({ success: true, data: data }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        // Return true to indicate we wish to send a response asynchronously
        return true;
    }
});

// Optional: Clicking the toolbar icon toggles the sidebar
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" });
});