This package coerces peer dependencies for &#x60;@rxap&#x60; packages, ensuring they are correctly installed in the project. It also runs init generators for peer dependencies that have them. It can also move the package from devDependencies to dependencies or vice versa based on the package name.

[![npm version](https://img.shields.io/npm/v/@rxap/material-directives?style=flat-square)](https://www.npmjs.com/package/@rxap/material-directives)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/material-directives)
![npm](https://img.shields.io/npm/dm/@rxap/material-directives)
![NPM](https://img.shields.io/npm/l/@rxap/material-directives)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/material-directives
```
**Install peer dependencies:**
```bash
yarn add @angular/core @angular/material @rxap/browser-utilities @rxap/ngx-memory @rxap/rxjs @rxap/utilities rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/material-directives:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/material-directives:init
```
