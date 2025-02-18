This package provides utilities for initializing Sentry in Angular applications. It includes functions to determine the Sentry environment and release based on the application&#x27;s environment, and a function to initialize Sentry with these configurations. It also includes a generator to add peer dependencies to the package.json.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-sentry?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-sentry)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-sentry)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-sentry)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-sentry)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-sentry
```
**Install peer dependencies:**
```bash
yarn add @rxap/config@^19.0.2-dev.0 @rxap/environment@^19.0.2-dev.0 @sentry/angular@^8.18.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-sentry:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-sentry:init
```
