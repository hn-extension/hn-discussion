const { cmd } = require('@semantic-release/exec/lib/utils'); // or just use child_process
const execSync = require('child_process').execSync;
const path = require('path');

console.log("Signing and Uploading to Firefox AMO...");

// We need to point to the SOURCE DIRECTORY, not the zip, for web-ext
const sourceDir = path.join(__dirname, '..', 'dist', 'firefox');

try {
    // This command signs the addon and uploads it to the store ("listed")
    // Note: --channel=listed is required for the public store
    execSync(`npx web-ext sign --source-dir "${sourceDir}" --channel=listed --api-key=${process.env.FIREFOX_API_KEY} --api-secret=${process.env.FIREFOX_API_SECRET} --id=${process.env.FIREFOX_EXTENSION_ID}`, { stdio: 'inherit' });

    console.log("Firefox Upload Complete.");
} catch (error) {
    console.error("Firefox Upload Failed. (Note: This might fail if the version matches an existing version exactly)");
    process.exit(1);
}