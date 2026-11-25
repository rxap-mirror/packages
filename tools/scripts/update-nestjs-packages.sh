#!/bin/sh
# Updates the NestJS group (lockstep @nestjs/core, common, platform-*, testing, ... plus the followers such as
# @nestjs/swagger, class-validator, helmet) to the newest version whose whole group passed the release cooldown.
# Group definition: tools/scripts/lib/framework-groups.mjs.

GIT_ROOT=$(git rev-parse --show-toplevel)

cd "${GIT_ROOT}" || exit 1

node tools/scripts/align-framework-group.mjs nestjs --latest || exit 1
node tools/scripts/align-framework-dep-versions.mjs || exit 1

pnpm install
