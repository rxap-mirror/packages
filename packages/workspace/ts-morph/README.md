This package provides utilities for transforming workspace files using the TypeScript compiler API via ts-morph. It includes functions to add directories to a ts-morph project, apply ts-morph project changes to a tree, and perform transformations on Angular and Nest projects. The package also offers an init generator for adding peer dependencies to a project.

[![npm version](https://img.shields.io/npm/v/@rxap/workspace-ts-morph?style=flat-square)](https://www.npmjs.com/package/@rxap/workspace-ts-morph)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/workspace-ts-morph)
![npm](https://img.shields.io/npm/dm/@rxap/workspace-ts-morph)
![NPM](https://img.shields.io/npm/l/@rxap/workspace-ts-morph)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/workspace-ts-morph
```
**Execute the init generator:**
```bash
yarn nx g @rxap/workspace-ts-morph:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/workspace-ts-morph:init
```
