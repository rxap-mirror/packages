#!/bin/bash

echo "Link @rxap/utilities:"

nx run utilities:build --with-deps
yarn --cwd dist/libs/utilities link
yarn link @rxap/utilities

echo "Link @rxap/schematics-utilities:"

nx run schematics-utilities:build --with-deps
yarn --cwd dist/libs/schematics/utilities link
yarn link @rxap/schematics-utilities

echo "Link @rxap/schematics-html:"

nx run schematics-html:build --with-deps
yarn --cwd dist/libs/schematics/html link
yarn link @rxap/schematics-html

echo "Link @rxap/schematics-open-api:"

nx run schematics-open-api:build --with-deps
yarn --cwd dist/libs/schematics/open-api link
yarn link @rxap/schematics-open-api

echo "Link @rxap/schematics-ts-morph:"

nx run schematics-ts-morph:build --with-deps
yarn --cwd dist/libs/schematics/ts-morph link
yarn link @rxap/schematics-ts-morph

echo "Link @rxap/schematics-xml-parser:"

nx run schematics-xml-parser:build --with-deps
yarn --cwd dist/libs/schematics/xml-parser link
yarn link @rxap/schematics-xml-parser

echo "Link @rxap/schematics-form:"

nx run schematics-form:build --with-deps
yarn --cwd dist/libs/schematics/form link
yarn link @rxap/schematics-form

echo "Link @rxap/schematics-table:"

nx run schematics-table:build --with-deps
yarn --cwd dist/libs/schematics/table link
yarn link @rxap/schematics-table
