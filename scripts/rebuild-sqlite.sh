#!/bin/bash
# Script to rebuild better-sqlite3 native bindings for Bun
# Run with: bash scripts/rebuild-sqlite.sh

set -e

echo "🔧 Rebuilding better-sqlite3 native bindings..."

# Check if build tools are available
if ! command -v python3 &> /dev/null; then
  echo "❌ Python3 is required. Install with: sudo pacman -S python"
  exit 1
fi

if ! command -v g++ &> /dev/null; then
  echo "❌ g++ is required. Install with: sudo pacman -S gcc"
  exit 1
fi

if ! command -v make &> /dev/null; then
  echo "❌ make is required. Install with: sudo pacman -S make"
  exit 1
fi

echo "✅ Build tools found"

# Navigate to project root
cd "$(dirname "$0")/.."

# Remove existing build
echo "🧹 Cleaning existing build..."
rm -rf node_modules/better-sqlite3/build

# Rebuild using node-gyp
echo "🔨 Building native bindings..."
cd node_modules/better-sqlite3

# Try with bun's node-gyp
if command -v bunx &> /dev/null; then
  bunx node-gyp rebuild
elif command -v npx &> /dev/null; then
  npx node-gyp rebuild
else
  echo "❌ Neither bunx nor npx found"
  exit 1
fi

cd ../..

# Verify the build
if [ -f "node_modules/better-sqlite3/build/Release/better_sqlite3.node" ]; then
  echo "✅ Build successful!"
  echo "📦 Native bindings located at:"
  echo "   node_modules/better-sqlite3/build/Release/better_sqlite3.node"
else
  echo "❌ Build failed - bindings file not found"
  exit 1
fi
