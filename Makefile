# Makefile for HN Sidebar Extension

# Default version if none is provided
VERSION ?= 1.0.0

# Ensure these targets are always executed, even if a file matches the name
.PHONY: help install clean build publish-dry-run release-dry-run

# -- Help ---------------------------------------------------------------------
help:
	@echo "Hacker News Sidebar Extension - Build Tools"
	@echo "----------------------------------------------------------------"
	@echo "  make install           Install Node dependencies"
	@echo "  make clean             Remove build artifacts (dist/ folders and zips)"
	@echo "  make build             Build zips locally (default version: 1.0.0)"
	@echo "  make build VERSION=1.2.3 Build zips with a specific version"
	@echo "  make publish-dry-run   Test the upload scripts in mock mode"
	@echo "  make release-dry-run   Test semantic-release logic (requires GITHUB_TOKEN)"
	@echo "----------------------------------------------------------------"

# -- Setup --------------------------------------------------------------------
install:
	npm install

# -- Cleanup ------------------------------------------------------------------
clean:
	@echo "Cleaning up..."
	rm -rf dist
	rm -f chrome-extension.zip firefox-extension.zip

# -- Build --------------------------------------------------------------------
# Usage: make build OR make build VERSION=1.1.0
build: clean
	@echo "Building version $(VERSION)..."
	npm run build -- $(VERSION)
	@echo "Build complete."
	@echo "   - chrome-extension.zip"
	@echo "   - firefox-extension.zip"

# -- Testing ------------------------------------------------------------------
# Runs the publish scripts with DRY_RUN=true to verify logic/secrets locally
publish-dry-run: build
	@echo "Testing Chrome Upload Script (DRY RUN)..."
	@DRY_RUN=true node scripts/publish-chrome.js
	@echo "-----------------------------------"
	@echo "Testing Firefox Upload Script (DRY RUN)..."
	@DRY_RUN=true node scripts/publish-firefox.js

# Runs semantic-release locally to see what the next version WOULD be
release-dry-run:
	@if [ -z "$(GITHUB_TOKEN)" ]; then \
		echo "Error: GITHUB_TOKEN is missing. Export it first."; \
		exit 1; \
	fi
	@echo "Running Semantic Release (Dry Run)..."
	npm run release:dry-run
