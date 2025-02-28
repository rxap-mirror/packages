Provides a base definition class and related utilities for managing and loading definitions in Angular applications. It includes metadata handling, dependency injection support, and lifecycle management for definitions. This package simplifies the creation and management of configurable and extensible application components.

[![npm version](https://img.shields.io/npm/v/@rxap/definition?style=flat-square)](https://www.npmjs.com/package/@rxap/definition)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/definition)
![npm](https://img.shields.io/npm/dm/@rxap/definition)
![NPM](https://img.shields.io/npm/l/@rxap/definition)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/definition
```
**Install peer dependencies:**
```bash
yarn add @angular/core @rxap/reflect-metadata @rxap/utilities rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/definition:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/definition:init
```
