const fs = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

async function main() {
  const sourceDir = path.join(__dirname, "..", "dist", "firefox");
  const manifestPath = path.join(sourceDir, "manifest.json");
  const apiKey = process.env.WEB_EXT_API_KEY || process.env.FIREFOX_API_KEY;
  const apiSecret =
    process.env.WEB_EXT_API_SECRET || process.env.FIREFOX_API_SECRET;

  if (!fs.existsSync(manifestPath)) {
    console.error(`Firefox build not found at ${sourceDir}. Run npm run build first.`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const extensionId = manifest.browser_specific_settings?.gecko?.id;
  if (!extensionId) {
    console.error("The Firefox manifest is missing browser_specific_settings.gecko.id.");
    process.exit(1);
  }

  if (process.env.DRY_RUN === "true") {
    console.log(`[dry run] Would submit ${extensionId} ${manifest.version} to AMO.`);
    return;
  }

  if (!apiKey || !apiSecret) {
    console.error(
      "Missing Firefox credentials. Set FIREFOX_API_KEY and FIREFOX_API_SECRET.",
    );
    process.exit(1);
  }

  console.log(`Submitting ${extensionId} ${manifest.version} to Firefox Add-ons...`);

  const result = spawnSync(
    "npx",
    [
      "--no-install",
      "web-ext",
      "sign",
      "--source-dir",
      sourceDir,
      "--channel",
      "listed",
      "--no-input",
    ],
    {
      env: {
        ...process.env,
        WEB_EXT_API_KEY: apiKey,
        WEB_EXT_API_SECRET: apiSecret,
      },
      stdio: "inherit",
    },
  );

  if (result.error) {
    console.error(`Could not start web-ext: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error("Firefox upload failed.");
    process.exit(result.status || 1);
  }

  console.log("Firefox upload completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
