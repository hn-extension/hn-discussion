#!/bin/bash

# Create dist folders
mkdir -p dist/chrome dist/firefox

# Copy files
cp background.js content.js options.js options.html styles.css dist/chrome/
cp background.js content.js options.js options.html styles.css dist/firefox/
# Add icons if you have them: cp -r icons dist/chrome/

# Copy Manifests
cp manifest_chrome.json dist/chrome/manifest.json
cp manifest_firefox.json dist/firefox/manifest.json

# Zip Chrome
cd dist/chrome
zip -r ../../chrome-extension.zip .
cd ../..

# Zip Firefox
cd dist/firefox
zip -r ../../firefox-extension.zip .
cd ../..

echo "Zips created successfully."