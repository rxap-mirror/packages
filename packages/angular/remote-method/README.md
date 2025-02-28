This package provides abstractions for defining and executing remote methods in Angular applications. It includes features such as automatic refreshing, proxying, and error handling. It offers a structured way to manage remote calls and their dependencies.

[![npm version](https://img.shields.io/npm/v/@rxap/remote-method?style=flat-square)](https://www.npmjs.com/package/@rxap/remote-method)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/remote-method)
![npm](https://img.shields.io/npm/dm/@rxap/remote-method)
![NPM](https://img.shields.io/npm/l/@rxap/remote-method)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/remote-method
```
**Install peer dependencies:**
```bash
yarn add @angular/common @angular/core @rxap/definition @rxap/rxjs @rxap/utilities rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/remote-method:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/remote-method:init
```
