Provides interfaces and types for implementing common patterns like commands, data sources, and methods with metadata. It offers a structured approach to defining and interacting with data and actions in a consistent manner. The package also includes an init generator for managing peer dependencies in a workspace.

[![npm version](https://img.shields.io/npm/v/@rxap/pattern?style=flat-square)](https://www.npmjs.com/package/@rxap/pattern)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/pattern)
![npm](https://img.shields.io/npm/dm/@rxap/pattern)
![NPM](https://img.shields.io/npm/l/@rxap/pattern)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/pattern
```
**Install peer dependencies:**
```bash
yarn add rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/pattern:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/pattern:init
```
