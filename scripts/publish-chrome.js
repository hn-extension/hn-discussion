const fs = require('fs');
const path = require('path');

async function main() {
    const { default: chromeWebstoreUpload } = await import('chrome-webstore-upload');

    const zipPath = path.join(__dirname, '..', 'chrome-extension.zip');

    // Check if zip exists
    if (!fs.existsSync(zipPath)) {
        console.error("Error: Chrome zip not found at:", zipPath);
        process.exit(1);
    }

    console.log("Authenticating with Chrome Web Store...");

    // DRY RUN CHECK
    if (process.env.DRY_RUN === 'true') {
        console.log(">> [DRY RUN] Skipping actual upload.");
        console.log(`>> [DRY RUN] Would upload: ${zipPath}`);
        console.log(`>> [DRY RUN] Target Extension ID: ${process.env.CHROME_EXTENSION_ID || 'Not Set'}`);
        return;
    }

    // Check required Env Vars
    if (!process.env.CHROME_EXTENSION_ID || !process.env.CHROME_CLIENT_ID || !process.env.CHROME_CLIENT_SECRET || !process.env.CHROME_REFRESH_TOKEN) {
        console.error("Error: Missing Chrome Web Store secrets (CLIENT_ID, SECRET, REFRESH_TOKEN, or EXTENSION_ID).");
        process.exit(1);
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
        console.log("✅ Upload response:", res);

        // Optional: Uncomment to auto-publish immediately (skips manual review trigger)
        // console.log("Publishing...");
        // await store.publish();
        // console.log("Published successfully");
    } catch (err) {
        console.error("Chrome Upload Failed:", err);
        process.exit(1);
    }
}

main();