#!/bin/bash

echo "Link @rxap/utilities:"

nx run utilities:build --with-deps
yarn --cwd dist/libs/utilities link
yarn link @rxap/utilities
