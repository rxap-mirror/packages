Provides a set of Angular pipes for common data transformations, including currency formatting, string manipulation, and object property access. These pipes offer standalone functionality for easy integration into Angular templates. The package includes pipes for escaping quotation marks, joining arrays, limiting array length, replacing substrings, slicing arrays, truncating strings, and deleting identifier properties from objects.

[![npm version](https://img.shields.io/npm/v/@rxap/pipes?style=flat-square)](https://www.npmjs.com/package/@rxap/pipes)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/pipes)
![npm](https://img.shields.io/npm/dm/@rxap/pipes)
![NPM](https://img.shields.io/npm/l/@rxap/pipes)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/pipes
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/platform-browser@^19.1.3 @rxap/utilities@^16.4.2 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/pipes:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/pipes:init
```
