# Releasing

Releases are automated from the repository's default branch with
[semantic-release](https://github.com/semantic-release/semantic-release).
The workflow supports both `master` (the current default) and `main`.

## One-time Firefox setup

1. Open the
   [Firefox Add-ons API keys page](https://addons.mozilla.org/en-US/developers/addon/api/key/)
   and create API credentials for the AMO account that owns the extension.
2. In the GitHub repository, open **Settings → Secrets and variables → Actions**.
3. Add these repository secrets:
   - `FIREFOX_API_KEY`: the AMO JWT issuer.
   - `FIREFOX_API_SECRET`: the AMO JWT secret.

The extension ID is already declared in `manifest_firefox.json` and matches the
published `hn-discussion` add-on. It does not need to be stored as a secret.

Configure these secrets before merging the first releasable commit. A release
can still be created without them, but the Firefox publishing step will fail
until the credentials are available. After fixing a transient failure or
adding missing credentials, re-run the failed GitHub Actions workflow; the
workflow recognizes the existing tag and retries the Firefox submission.

## Creating a release

Commit messages use Conventional Commits:

- `fix: ...` creates a patch release.
- `feat: ...` creates a minor release.
- A `BREAKING CHANGE:` footer creates a major release.
- Changes such as `docs:`, `test:`, and `chore:` do not create a release by
  default.

When a releasable commit reaches `master` or `main`, the Release workflow:

1. Builds and validates the Firefox package.
2. Calculates the next version and creates a `vX.Y.Z` Git tag.
3. Creates a GitHub Release with release notes.
4. Attaches unsigned Chrome and Firefox ZIP files to the GitHub Release.
5. Submits the Firefox build to addons.mozilla.org for signing and review.

AMO controls when a submitted listed version becomes publicly available.

The repository has no existing release tag, so the first automated release is
expected to be `v1.0.0`.

## Local checks

Install dependencies and run the same package validation used by CI:

```bash
npm ci
npm run check
```

Build a particular version:

```bash
npm run build -- 1.2.3
```

Exercise the publisher without contacting AMO:

```bash
DRY_RUN=true npm run publish:firefox
```

Preview the next semantic release (a GitHub token is required because
semantic-release inspects the remote repository):

```bash
GITHUB_TOKEN=... npm run release:dry-run
```

## Chrome later

Chrome packaging and `scripts/publish-chrome.js` are retained, but the Release
workflow does not call the Chrome Web Store publisher. Enabling Chrome later
only requires adding its store credentials, deciding whether uploads should be
automatically published, and adding `npm run publish:chrome` as a release step.
