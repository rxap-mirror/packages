Provides utility functions for Nx plugins, such as retrieving project dependencies, determining output paths, and interacting with package.json files. It simplifies common tasks within Nx executors and generators. This package helps streamline plugin development by offering pre-built functionalities for project analysis and manipulation.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-utilities?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-utilities)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-utilities)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-utilities)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-utilities)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-utilities
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-utilities:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/plugin-utilities:init
```
