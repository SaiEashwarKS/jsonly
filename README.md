# jsonly

jsonly is a browser extension (Chrome and Firefox) that automatically detects JSON on a webpage and provides a way to view it formatted, search, collapse nodes, edit, and copy.

## Repository layout

This is a pnpm + turborepo monorepo.

```
apps/
  chrome/             # Chrome MV3 extension (Vite build → apps/chrome/dist)
  firefox/            # Firefox MV3 extension (Vite build → apps/firefox/dist)
packages/
  extension-ui/       # Shared React UI used by both extensions
build.sh              # Reproducible build script (see below)
package.json          # Root scripts (build, package, etc.)
pnpm-workspace.yaml   # Workspace definition
pnpm-lock.yaml        # Locked dependency graph — required for reproducible builds
```

---

## Build instructions (for reviewers)

These instructions reproduce the exact `chrome.zip` and `firefox.zip` artifacts submitted to the Chrome Web Store and addons.mozilla.org.

### Operating system

Any Unix-like OS with a POSIX shell and the `zip` utility will work. The extension was built and tested on:

- **macOS 26 (Darwin, arm64)** — primary development/build environment
- Linux (Ubuntu 22.04+) and Windows (via WSL2) are also supported

`zip` is preinstalled on macOS and most Linux distributions. On Debian/Ubuntu: `sudo apt-get install zip`.

### Required programs

| Program | Required version | Notes |
|---|---|---|
| Node.js | **20.x or newer** (built with 24.6.0) | https://nodejs.org/ or use `nvm` |
| pnpm    | **10.33.0** (pinned in `package.json` via `packageManager`) | `npm install -g pnpm@10.33.0` or enable via Corepack |
| zip     | any recent version | preinstalled on macOS/Linux |

#### Installing Node.js

Download an installer from https://nodejs.org/ (LTS is fine), or with `nvm`:

```bash
# Install nvm (https://github.com/nvm-sh/nvm), then:
nvm install 24
nvm use 24
node --version   # should print v24.x.x (or v20.x+)
```

#### Installing pnpm

The project pins pnpm 10.33.0 via the `"packageManager"` field in `package.json`. The recommended installation is via Corepack (bundled with Node.js 16.10+):

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
pnpm --version   # should print 10.33.0
```

Alternatively, install globally with npm:

```bash
npm install -g pnpm@10.33.0
```

### Step-by-step build

From a clean checkout of the source tree:

```bash
# 1. Change into the project directory
cd jsonly

# 2. Install all workspace dependencies from the locked manifest.
#    --frozen-lockfile guarantees the installed versions match pnpm-lock.yaml
#    exactly, making the build reproducible.
pnpm install --frozen-lockfile

# 3. Build every workspace (runs `vite build` for chrome, firefox, and
#    extension-ui via turborepo). Outputs land in apps/<browser>/dist/.
pnpm build

# 4. Package the unpacked builds into zip artifacts at the repo root.
pnpm package:chrome     # → chrome.zip
pnpm package:firefox    # → firefox.zip
```

Or run all of the above in one command:

```bash
pnpm package
```

Or run the all-in-one build script (equivalent to `pnpm install --frozen-lockfile && pnpm package`):

```bash
./build.sh
```

### Build output

After a successful build:

- `apps/chrome/dist/`  — unpacked Chrome extension (loadable via `chrome://extensions` → "Load unpacked")
- `apps/firefox/dist/` — unpacked Firefox extension (loadable via `about:debugging` → "Load Temporary Add-on…")
- `chrome.zip`  — the Chrome Web Store submission artifact
- `firefox.zip` — the addons.mozilla.org submission artifact

---

## Development

```bash
pnpm install              # install workspace dependencies
pnpm dev                  # watch-build all packages
pnpm test                 # run the extension-ui test suite (vitest)
pnpm lint                 # oxlint
pnpm format               # oxfmt
```

To try the extension locally during development:

- **Chrome**: open `chrome://extensions`, enable Developer mode, click "Load unpacked", and select `apps/chrome/dist`.
- **Firefox**: open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on…", and select any file inside `apps/firefox/dist` (e.g. `manifest.json`).

## License

See [LICENSE](./LICENSE).
