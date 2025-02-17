This package provides utilities for Nx generators, specifically to handle peer dependencies. It helps to coerce peer dependencies for other packages, ensuring they are correctly installed and configured. It also runs init generators for peer dependencies.

[![npm version](https://img.shields.io/npm/v/@rxap/generator-utilities?style=flat-square)](https://www.npmjs.com/package/@rxap/generator-utilities)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/generator-utilities)
![npm](https://img.shields.io/npm/dm/@rxap/generator-utilities)
![NPM](https://img.shields.io/npm/l/@rxap/generator-utilities)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/generator-utilities
```
**Execute the init generator:**
```bash
yarn nx g @rxap/generator-utilities:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/generator-utilities:init
```
