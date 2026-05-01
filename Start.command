#!/bin/zsh

set -e

# Always run from this script's directory
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "➡️  Starting Label Generator..."

# Ensure a usable PATH when launched from Finder
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# Try to load nvm (common when Node isn't on PATH in Finder-launched shells)
if ! command -v node >/dev/null 2>&1; then
  export NVM_DIR="$HOME/.nvm"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
  fi
fi

# Verify Node.js
if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "Node.js is required but was not found in PATH.\n\nPlease install Node.js 20+ and try again." buttons {"OK"} default button "OK" with icon caution'
  open "https://nodejs.org/en/download"
  exit 1
fi

# Verify npm
if ! command -v npm >/dev/null 2>&1; then
  osascript -e 'display dialog "npm was not found.\n\nInstall Node.js (which includes npm) and try again." buttons {"OK"} default button "OK" with icon caution'
  open "https://nodejs.org/en/download"
  exit 1
fi

# Install dependencies if needed (or ensure present)
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies (first run)..."
  npm install
else
  echo "📦 Ensuring dependencies are installed..."
  npm install
fi

echo "🚀 Launching development server and opening your browser..."

# Pass --open through npm to vite so it opens the default browser
npm run dev -- --open
