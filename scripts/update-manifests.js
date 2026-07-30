const fs = require("fs");
const path = require("path");

const projectDir = path.join(__dirname, "..");
const newVersion = process.argv[2];
const manifestArguments = process.argv.slice(3);
const manifestFiles =
  manifestArguments.length > 0
    ? manifestArguments
    : ["manifest_chrome.json", "manifest_firefox.json"];

if (!newVersion || !/^\d+(\.\d+){0,3}$/.test(newVersion)) {
  console.error(`Invalid browser extension version: ${newVersion || "(missing)"}`);
  process.exit(1);
}

manifestFiles.forEach((file) => {
  const filePath = path.resolve(projectDir, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Manifest not found: ${filePath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
  manifest.version = newVersion;
  fs.writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Set ${path.relative(projectDir, filePath)} to version ${newVersion}.`);
});
