Provides a set of classes and decorators for creating and managing data sources in Angular applications, including base classes, static data sources, observable data sources, and method data sources. It also includes a component for displaying data source errors. The library offers features like data persistence, refresh and retry mechanisms, and integration with RxJS observables.

[![npm version](https://img.shields.io/npm/v/@rxap/data-source?style=flat-square)](https://www.npmjs.com/package/@rxap/data-source)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/data-source)
![npm](https://img.shields.io/npm/dm/@rxap/data-source)
![NPM](https://img.shields.io/npm/l/@rxap/data-source)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/data-source
```
**Install peer dependencies:**
```bash
yarn add @angular/cdk@^19.1.1 @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/material@^19.1.1 @rxap/data-structure-tree@^1.1.13 @rxap/definition@^19.0.2 @rxap/environment@^19.0.2 @rxap/pattern@^1.1.12 @rxap/rxjs@^1.1.13 @rxap/utilities@^16.4.3 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/data-source:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/data-source:init
```
