# Hacker News Discussion Sidebar

A browser extension that helps you find Hacker News discussions for the page you are currently viewing.

The extension adds a small floating Hacker News button to web pages. Open it to search Hacker News via the Algolia HN API, view matching submissions, read comments in a sidebar, or submit the current page to Hacker News.

## Install

- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/hn-discussion/)

## Features

- Find Hacker News discussions for the current page URL.
- Search by full page path or by domain.
- View matching submissions, points, comment counts, and dates.
- Read Hacker News comments directly in a sidebar.
- Open the original Hacker News thread in a new tab.
- Submit the current page to Hacker News when no discussion exists yet.
- Hide the floating button on selected sites.
- Temporarily show the button again with `Alt` + `Shift` + `H`.

## Usage

1. Install the extension.
2. Visit any web page.
3. Click the orange `Y` button in the bottom-right corner.
4. The sidebar opens and searches for Hacker News discussions for the current URL.
5. Use the hover controls to search by:
   - **Domain** — searches for discussions related to the current domain.
   - **Full Path** — searches for discussions related to the exact page URL.

If multiple discussions are found, expand the **discussions found** section and select the thread you want to view.

## Hiding the Button on a Site

Hover over the floating Hacker News button and click the small close icon to hide it on the current domain.

You can manage hidden sites from the extension options page.

To temporarily show the button again on a hidden site, press:

```text
Alt + Shift + H
```

## Privacy

The extension uses the current page URL or domain to search Hacker News discussions through the Algolia Hacker News API.

It does not run its own tracking server and does not sell browsing data. Hidden-site preferences are stored locally in your browser.

See [PRIVACY.md](PRIVACY.md) for the full privacy policy.

## Development

Install dependencies:

```bash
npm install
```

Build browser extension zip files:

```bash
make build
```

Build with a specific version:

```bash
make build VERSION=1.2.3
```

This creates:

- `chrome-extension.zip`
- `firefox-extension.zip`

## Release Notes

This project uses semantic-release. Commit messages should follow the Conventional Commits format, for example:

```text
fix: correct discussion title color
feat: add new sidebar control
chore: update build tooling
```

## License

ISC
