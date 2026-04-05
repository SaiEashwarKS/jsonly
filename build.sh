#!/usr/bin/env bash
# Build script for jsonly — produces chrome.zip and firefox.zip at the repo root.
#
# Requirements (see README.md for installation details):
#   - Node.js 20.x or newer (tested with 24.6.0)
#   - pnpm 10.33.0 (pinned via the "packageManager" field in package.json)
#   - zip (preinstalled on macOS/Linux)
#
# Usage: ./build.sh

set -euo pipefail

# Move into the directory containing this script so the script works
# regardless of where it is invoked from.
cd "$(dirname "$0")"

echo "==> Node version:  $(node --version)"
echo "==> pnpm version:  $(pnpm --version)"

# 1. Install all workspace dependencies with a frozen lockfile so the
#    build is reproducible and matches the committed pnpm-lock.yaml.
echo "==> Installing dependencies (pnpm install --frozen-lockfile)"
pnpm install --frozen-lockfile

# 2. Build every workspace package via turbo. This runs `vite build`
#    for apps/chrome, apps/firefox, and packages/extension-ui, emitting
#    the unpacked extensions into apps/<browser>/dist.
echo "==> Building extensions (pnpm build)"
pnpm build

# 3. Zip each dist/ directory into the repo-root artifact expected by
#    the Chrome Web Store and addons.mozilla.org reviewers.
echo "==> Packaging chrome.zip"
rm -f chrome.zip
(cd apps/chrome/dist && zip -r ../../../chrome.zip . -x '*.DS_Store')

echo "==> Packaging firefox.zip"
rm -f firefox.zip
(cd apps/firefox/dist && zip -r ../../../firefox.zip . -x '*.DS_Store')

echo "==> Done. Artifacts:"
ls -lh chrome.zip firefox.zip
