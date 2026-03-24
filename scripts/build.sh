#!/usr/bin/env bash
# ─── Build script: React → gas/index.html ────────────────────────────────────
# Run from the project root:  ./scripts/build.sh
# Then push to GAS:           npx clasp push

set -e  # Exit on error

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
GAS_DIR="$ROOT_DIR/gas"

echo "🔨  Building React client…"
cd "$CLIENT_DIR"

# Install deps if node_modules missing
if [ ! -d "node_modules" ]; then
  echo "   Installing client dependencies…"
  npm install
fi

npm run build

echo "✅  Build complete — gas/index.html updated"
echo ""
echo "Next steps:"
echo "  1.  cd \"$ROOT_DIR\""
echo "  2.  npx clasp push        (push to Google Apps Script)"
echo "  3.  npx clasp deploy      (create a new deployment / update current)"
echo "  4.  npx clasp open        (open the GAS project in browser)"
