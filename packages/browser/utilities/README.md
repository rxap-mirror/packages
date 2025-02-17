Provides browser utilities such as clicking on a link programmatically and observing the height of an element. Includes functionality to handle peer dependencies within an Nx workspace. It also includes an init generator to add missing peer dependencies to package.json.

[![npm version](https://img.shields.io/npm/v/@rxap/browser-utilities?style=flat-square)](https://www.npmjs.com/package/@rxap/browser-utilities)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/browser-utilities)
![npm](https://img.shields.io/npm/dm/@rxap/browser-utilities)
![NPM](https://img.shields.io/npm/l/@rxap/browser-utilities)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/browser-utilities
```
**Install peer dependencies:**
```bash
yarn add rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/browser-utilities:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/browser-utilities:init
```
