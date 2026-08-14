#!/bin/bash

set -e

root_dir="$PWD"
pnpm -r --include-workspace-root exec node "$root_dir/scripts/version.js" "$1"
pnpm -r run build

git add .
git commit -m "Bump version to $1"

git tag "v$1"

pnpm -r publish