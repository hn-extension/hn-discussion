#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
VERSION="${1:-$(node -p "require('$PROJECT_DIR/package.json').version")}"

if [[ ! "$VERSION" =~ ^[0-9]+(\.[0-9]+){0,3}$ ]]; then
    echo "Invalid browser extension version: $VERSION" >&2
    exit 1
fi

CHROME_DIR="$PROJECT_DIR/dist/chrome"
FIREFOX_DIR="$PROJECT_DIR/dist/firefox"
CHROME_ZIP="$PROJECT_DIR/chrome-extension.zip"
FIREFOX_ZIP="$PROJECT_DIR/firefox-extension.zip"
EXTENSION_FILES=(
    background.js
    content.js
    options.js
    options.html
    styles.css
)

rm -rf -- "$CHROME_DIR" "$FIREFOX_DIR"
rm -f -- "$CHROME_ZIP" "$FIREFOX_ZIP"
mkdir -p -- "$CHROME_DIR" "$FIREFOX_DIR"

for file in "${EXTENSION_FILES[@]}"; do
    cp -- "$PROJECT_DIR/$file" "$CHROME_DIR/"
    cp -- "$PROJECT_DIR/$file" "$FIREFOX_DIR/"
done

cp -- "$PROJECT_DIR/manifest_chrome.json" "$CHROME_DIR/manifest.json"
cp -- "$PROJECT_DIR/manifest_firefox.json" "$FIREFOX_DIR/manifest.json"

node "$SCRIPT_DIR/update-manifests.js" \
    "$VERSION" \
    "$CHROME_DIR/manifest.json" \
    "$FIREFOX_DIR/manifest.json"

(
    cd -- "$CHROME_DIR"
    zip -q -r "$CHROME_ZIP" .
)

(
    cd -- "$FIREFOX_DIR"
    zip -q -r "$FIREFOX_ZIP" .
)

echo "Built Chrome and Firefox packages for version $VERSION."
