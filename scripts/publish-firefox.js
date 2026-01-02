const { execSync } = require('child_process');
const path = require('path');

async function main() {
    console.log("Preparing Firefox Upload...");
    // DRY RUN CHECK
    if (process.env.DRY_RUN === 'true') {
        console.log(">> [DRY RUN] Skipping web-ext sign.");
        console.log(`>> [DRY RUN] Source Dir: ${path.join(__dirname, '..', 'dist', 'firefox')}`);
        return;
    }

    // Check required Env Vars
    if (!process.env.FIREFOX_API_KEY || !process.env.FIREFOX_API_SECRET || !process.env.FIREFOX_EXTENSION_ID) {
        console.error("Error: Missing Firefox secrets (FIREFOX_API_KEY, FIREFOX_API_SECRET, or FIREFOX_EXTENSION_ID).");
        process.exit(1);
    }

    try {
        // This command signs the addon and uploads it to the store ("listed")
        // We use stdio: 'inherit' to show the web-ext output directly in the console
        const cmd = `npx web-ext sign --source-dir "${sourceDir}" --channel=listed --api-key=${process.env.FIREFOX_API_KEY} --api-secret=${process.env.FIREFOX_API_SECRET} --id=${process.env.FIREFOX_EXTENSION_ID}`;

        execSync(cmd, { stdio: 'inherit' });

        console.log("Firefox Upload Complete.");
    } catch (error) {
        console.error("Firefox Upload Failed.");
        // We don't print the error object here because it might contain the secret key in the command string
        process.exit(1);
    }
}

main();