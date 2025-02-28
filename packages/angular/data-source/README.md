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
yarn add @angular/cdk @angular/common @angular/core @angular/material @rxap/data-structure-tree @rxap/definition @rxap/environment @rxap/pattern @rxap/rxjs @rxap/utilities rxjs 
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
