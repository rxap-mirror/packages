This package provides an Angular module to load SVG icons from specified asset paths using the Angular Material Icon Registry. It simplifies the process of registering and using custom icons in Angular applications. The module allows configuring the icon asset paths and automatically loads the icon sets during initialization.

[![npm version](https://img.shields.io/npm/v/@rxap/icon?style=flat-square)](https://www.npmjs.com/package/@rxap/icon)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/icon)
![npm](https://img.shields.io/npm/dm/@rxap/icon)
![NPM](https://img.shields.io/npm/l/@rxap/icon)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/icon
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/material@^19.1.1 @angular/platform-browser@^19.1.3 @rxap/utilities@^16.4.3-dev.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/icon:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/icon:init
```
