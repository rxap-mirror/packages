#!/bin/bash

yarn nx run rxap:update-package-group --skip-nx-cache

git commit -am "fix: update package groups"
