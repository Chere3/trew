# Rebuilding better-sqlite3 Native Bindings

## The Problem

`better-sqlite3` is a native Node.js module that requires compiled C++ bindings. When using Bun, these bindings may not be built correctly, causing the "Could not locate the bindings file" error.

## Solutions

### Option 1: Rebuild with Build Script (Recommended)

```bash
bash scripts/rebuild-sqlite.sh
```

This script will:
1. Check for required build tools (python3, g++, make)
2. Clean existing build
3. Rebuild native bindings using node-gyp
4. Verify the build was successful

### Option 2: Manual Rebuild

If the script doesn't work, try manually:

```bash
# Install build tools (Arch Linux)
sudo pacman -S base-devel python cmake make gcc

# Rebuild
cd node_modules/better-sqlite3
bunx node-gyp rebuild
# or
npx node-gyp rebuild
```

### Option 3: Use Bun's Built-in SQLite (Alternative)

Bun has built-in SQLite support via `bun:sqlite` which doesn't require native bindings. However, Better Auth currently expects `better-sqlite3`. You would need to create an adapter.

### Option 4: Install via npm (if Bun has issues)

Sometimes installing via npm and then using with Bun works better:

```bash
npm install better-sqlite3
bun install  # Install other dependencies
```

## Required Build Tools

For Arch Linux:
```bash
sudo pacman -S base-devel python cmake make gcc clang
```

## Verify Installation

After rebuilding, verify the bindings exist:

```bash
ls -la node_modules/better-sqlite3/build/Release/better_sqlite3.node
```

If the file exists, the rebuild was successful!

## Why This Happens

- `better-sqlite3` uses `node-gyp` to compile C++ code
- The `postinstall` script may be blocked by `ignoreScripts` in package.json
- Bun's ABI may differ from Node.js, requiring a rebuild
- Build tools may not be installed on the system
