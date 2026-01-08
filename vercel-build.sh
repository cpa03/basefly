#!/bin/bash
set -e

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Set up Bun environment
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Install dependencies
bun install

# Build project
bun run build