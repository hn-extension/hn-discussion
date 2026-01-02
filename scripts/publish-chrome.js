const fs = require('fs');
const path = require('path');
const chromeWebstoreUpload = require('chrome-webstore-upload');

async function main() {
    const zipPath = path.join(__dirname, '..', 'chrome-extension.zip');

    if (!fs.existsSync(zipPath)) {
        console.error("Chrome zip not found!");
        process.exit(1);
    }

    console.log("Authenticating with Chrome Web Store...");
    // DRY RUN CHECK
    if (process.env.DRY_RUN === 'true') {
        console.log(">> [DRY RUN] Skipping actual upload.");
        console.log(`>> [DRY RUN] Would upload: ${zipPath}`);
        console.log(`>> [DRY RUN] Target Extension ID: ${process.env.CHROME_EXTENSION_ID}`);
        return; // Stop here
    }

    const store = chromeWebstoreUpload({
        extensionId: process.env.CHROME_EXTENSION_ID,
        clientId: process.env.CHROME_CLIENT_ID,
        clientSecret: process.env.CHROME_CLIENT_SECRET,
        refreshToken: process.env.CHROME_REFRESH_TOKEN
    });

    console.log("Uploading to Chrome Web Store...");
    const zipFile = fs.createReadStream(zipPath);

    try {
        const res = await store.uploadExisting(zipFile);
        console.log("Upload response:", res);

        // Optional: Auto-publish immediately (skip manual review click)
        // await store.publish();
        // console.log("Published successfully");
    } catch (err) {
        console.error("Chrome Upload Failed:", err);
        process.exit(1);
    }
}

main();