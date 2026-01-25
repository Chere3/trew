#!/bin/bash
# Wrapper script to run Storybook with actual npx (not bun's alias)

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Find the actual npx binary (not bun's alias)
NPX_BIN=$(command -v npx 2>/dev/null || which npx 2>/dev/null || echo "npx")

# Set NODE_PATH to include project's node_modules
export NODE_PATH="${PROJECT_ROOT}/node_modules:${NODE_PATH:-}"

# Run storybook with actual npx
exec "$NPX_BIN" storybook@10.2.0 "$@"
