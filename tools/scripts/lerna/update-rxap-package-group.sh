#!/bin/bash

yarn nx run rxap:update-package-group --skip-nx-cache

git add "packages/rxap/package.json"
git commit -m "fix: update package groups"
