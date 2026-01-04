# Privacy Policy for Hacker News Discussion Sidebar

**Last Updated:** 03 Jan 2026

This Privacy Policy describes how the **Hacker News Discussion Sidebar** extension ("we", "us", or "the extension") collects, uses, and discloses your information. We are committed to protecting your privacy and ensuring that your browsing data is handled securely and transparently.

### 1. Data Collection and Usage

To function correctly, this extension requires access to the URL of the website you are currently visiting. This data is used solely for the following purposes:

* **Page Content & URLs:** The extension utilizes the `activeTab` and scripting permissions to read the URL and title of the current tab. This is necessary to query the Hacker News database to find discussions related to that specific content.
* **Search Queries:** When the sidebar is activated (or if previously left open), the extension sends the current URL or domain name to the Algolia API (`hn.algolia.com`) to retrieve search results.

**We do not store your browsing history on our own servers, nor do we sell it to third parties.**

### 2. Local Data Storage

The extension uses your browser's local storage capabilities (`chrome.storage.local`) to save your user preferences.

* **Hidden Sites:** If you choose to hide the sidebar button on a specific website, we store that domain in your browser's local storage (`hiddenSites` list).
* **Purpose:** This data is stored locally on your device to persist your UI preferences across browser sessions. It is not transmitted to the developer.

### 3. Third-Party Services

This extension relies on a third-party service to provide search results.

* **Algolia (Hacker News API):**
* To find discussions, the extension sends search queries (containing the URL or domain of the page you are viewing) directly to the Algolia API.
* We do not control how Algolia handles this data. We recommend reviewing Algolia’s privacy policy for details on their data processing practices.



### 4. Permissions

The extension requests the following permissions for the stated reasons:

* **`activeTab` / `<all_urls>`:** Required to inject the sidebar into web pages and read the current URL to perform searches.
* **`storage`:** Required to save your list of hidden websites so the extension remembers where not to show the button.
* **`scripting`:** Used to insert the visual elements (sidebar and button) into the page.

### 5. User Control

You have full control over your data:

* **Manage Hidden Sites:** You can view and remove websites from your "Hidden Sites" list at any time by visiting the Extension Options page.
* **Uninstall:** You may uninstall the extension at any time. Upon uninstallation, all locally stored data (such as the hidden sites list) is removed from your browser.

### 6. Contact Information

If you have questions or concerns about this Privacy Policy, please contact us at:

**Bjorn**
hn-sidebar@bjorn.co.za