#!/usr/bin/env bash
# Build the site and publish it to the gh-pages branch, which GitHub Pages serves.
# Usage: npm run deploy
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "You have uncommitted changes. Commit or stash them first." >&2
  exit 1
fi

npm run build

WORKTREE="$(mktemp -d)"
trap 'git worktree remove --force "$WORKTREE" 2>/dev/null || true; rm -rf "$WORKTREE"' EXIT

git fetch origin gh-pages
git worktree add --force "$WORKTREE" gh-pages

# Replace the published files, keeping the branch's git metadata.
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -r dist/. "$WORKTREE"/
touch "$WORKTREE/.nojekyll"

git -C "$WORKTREE" add -A
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "Site is already up to date; nothing to deploy."
  exit 0
fi

git -C "$WORKTREE" commit -m "Deploy built site to GitHub Pages"
git -C "$WORKTREE" push origin gh-pages
echo "Deployed: https://officinaprima.github.io/dca/"
