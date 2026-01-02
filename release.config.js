module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    ["@semantic-release/exec", {
      "prepareCmd": "node scripts/update-manifests.js ${nextRelease.version} && bash scripts/build-zips.sh"
    }],
    ["@semantic-release/exec", {
      "publishCmd": "node scripts/publish-chrome.js && node scripts/publish-firefox.js"
    }],
    ["@semantic-release/git", {
      "assets": ["package.json", "manifest_chrome.json", "manifest_firefox.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    ["@semantic-release/github", {
      "assets": [
        {"path": "chrome-extension.zip", "label": "Chrome Extension"},
        {"path": "firefox-extension.zip", "label": "Firefox Extension"}
      ]
    }]
  ]
};