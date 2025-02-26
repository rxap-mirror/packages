This package provides a set of Angular directives, components, and services to enhance data tables with features like row expansion, full-text search, and row selection with checkboxes. It includes modules for easy integration of these features into existing Angular Material tables. The package offers components for controlling row expansion, displaying checkbox-based row selection, and filtering table data using full-text search.

[![npm version](https://img.shields.io/npm/v/@rxap/table-system?style=flat-square)](https://www.npmjs.com/package/@rxap/table-system)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/table-system)
![npm](https://img.shields.io/npm/dm/@rxap/table-system)
![NPM](https://img.shields.io/npm/l/@rxap/table-system)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/table-system
```
**Install peer dependencies:**
```bash
yarn add @angular/animations@^19.1.3 @angular/cdk@^19.1.1 @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/forms@^19.1.3 @angular/material@^19.1.1 @rxap/data-source@^19.0.3-dev.0 @rxap/material-table-system@^19.0.3-dev.0 @rxap/utilities@^16.4.3 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/table-system:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/table-system:init
```
