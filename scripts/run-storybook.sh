#!/bin/bash
# Wrapper script to run Storybook with bunx while ensuring Next.js modules are available

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Set NODE_PATH to include project's node_modules (must be absolute path)
export NODE_PATH="${PROJECT_ROOT}/node_modules:${NODE_PATH:-}"

# Ensure we're in the project root
cd "$PROJECT_ROOT"

# Pre-load Next.js require hook to help with module resolution
export NODE_OPTIONS="--require ${PROJECT_ROOT}/node_modules/next/dist/server/require-hook.js ${NODE_OPTIONS:-}"

# Run storybook with bunx
exec bunx storybook@10.2.0 "$@"
