#!/bin/bash

rm -fr dist/packages/rxap || true
mkdir -p dist/packages/rxap
cp packages/rxap/{package.json,LICENSE.md,README.md,LICENSE,CHANGELOG.md} dist/packages/rxap/
