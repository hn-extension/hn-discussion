module.exports = {
  branches: ["master", "main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/exec",
      {
        prepareCmd: "npm run build -- ${nextRelease.version}",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "chrome-extension.zip",
            label: "Chrome extension (unsigned)",
          },
          {
            path: "firefox-extension.zip",
            label: "Firefox extension (unsigned)",
          },
        ],
      },
    ],
  ],
};
