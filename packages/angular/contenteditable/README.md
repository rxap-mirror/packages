Provides an Angular directive to make any element contenteditable. It supports change detection and debouncing, and allows binding to a method for handling content changes. The package also includes an init generator for managing peer dependencies.

[![npm version](https://img.shields.io/npm/v/@rxap/contenteditable?style=flat-square)](https://www.npmjs.com/package/@rxap/contenteditable)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/contenteditable)
![npm](https://img.shields.io/npm/dm/@rxap/contenteditable)
![NPM](https://img.shields.io/npm/l/@rxap/contenteditable)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/contenteditable
```
**Install peer dependencies:**
```bash
yarn add @angular/core@^19.1.3 @rxap/pattern@^1.1.12-dev.1 @rxap/utilities@^16.4.3-dev.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/contenteditable:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/contenteditable:init
```
