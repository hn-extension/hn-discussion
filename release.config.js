module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm", // Updates package.json version

    // 1. Update Manifests using our custom script
    ["@semantic-release/exec", {
      "prepareCmd": "node scripts/update-manifests.js ${nextRelease.version} && bash scripts/build-zips.sh"
    }],

    // 2. Commit the modified package.json and manifests back to the repo
    ["@semantic-release/git", {
      "assets": ["package.json", "manifest_chrome.json", "manifest_firefox.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],

    // 3. Create the GitHub Release and upload the Zips
    ["@semantic-release/github", {
      "assets": [
        {"path": "chrome-extension.zip", "label": "Chrome Extension (v${nextRelease.version})"},
        {"path": "firefox-extension.zip", "label": "Firefox Extension (v${nextRelease.version})"}
      ]
    }]
  ]
};