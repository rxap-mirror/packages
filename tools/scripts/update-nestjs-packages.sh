#!/bin/sh
# Updates the NestJS-related root dependencies through the release cooldown (never the newest release):
# dependency-cooldown.mjs picks the newest eligible, peer-compatible version and writes exact versions.

GIT_ROOT=$(git rev-parse --show-toplevel)

cd "${GIT_ROOT}" || exit 1

ONLY=$(jq -r '[(.dependencies // {}), (.devDependencies // {}) | keys[]] | unique
  | map(select(test("@nestjs|cache-manager|class-transformer|class-validator|cookie-parser|helmet|swagger-ui-express|csurf|express")))
  | join(",")' package.json)

if [ -z "$ONLY" ]; then
  echo "No NestJS-related root dependencies found"
  exit 0
fi

node tools/scripts/dependency-cooldown.mjs --apply --only "$ONLY" || exit 1
node tools/scripts/align-framework-dep-versions.mjs || exit 1

pnpm install
