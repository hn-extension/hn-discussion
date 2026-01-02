const fs = require('fs');
const path = require('path');

// 1. Get the version passed by semantic-release
const newVersion = process.argv[2]; 
if (!newVersion) {
    console.error("No version provided!");
    process.exit(1);
}

console.log(`Updating manifests to version ${newVersion}...`);

// 2. Define the files to update
const manifests = [
    'manifest_chrome.json',
    'manifest_firefox.json'
];

// 3. Update each file
manifests.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        manifest.version = newVersion;
        fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2) + '\n');
        console.log(`Updated ${file}`);
    } else {
        console.error(`File not found: ${file}`);
    }
});