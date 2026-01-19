#!/bin/bash
# Script to fix better-sqlite3 installation with Bun
# This adds better-sqlite3 to trustedDependencies and reinstalls

set -e

echo "🔧 Fixing better-sqlite3 installation..."

cd "$(dirname "$0")/.."

# Check if better-sqlite3 is in trustedDependencies
if ! grep -q '"better-sqlite3"' package.json; then
  echo "❌ better-sqlite3 is not in trustedDependencies"
  echo "   Please add it to package.json first, then run this script again"
  exit 1
fi

echo "✅ better-sqlite3 is in trustedDependencies"

# Clean install
echo "🧹 Cleaning node_modules and lockfile..."
rm -rf node_modules
rm -f bun.lockb

echo "📦 Reinstalling dependencies (this will build better-sqlite3)..."
bun install

# Verify the build
if [ -f "node_modules/better-sqlite3/build/Release/better_sqlite3.node" ] || \
   [ -f "node_modules/better-sqlite3/build/better_sqlite3.node" ]; then
  echo ""
  echo "✅ Success! better-sqlite3 native bindings built successfully"
  echo ""
  echo "📦 Native bindings located at:"
  find node_modules/better-sqlite3 -name "better_sqlite3.node" 2>/dev/null | head -1
else
  echo ""
  echo "⚠️  Warning: Native bindings not found, but installation completed"
  echo "   You may need to rebuild manually:"
  echo "   bash scripts/rebuild-sqlite.sh"
fi
