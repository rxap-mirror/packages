This package provides a set of directives, decorators, mixins, and validators to simplify the creation of dynamic forms in Angular applications. It offers features such as automatic control creation, data source integration, component customization, and hide/show logic based on form state. The library aims to streamline form development by providing reusable components and abstractions for common form-related tasks.

[![npm version](https://img.shields.io/npm/v/@rxap/form-system?style=flat-square)](https://www.npmjs.com/package/@rxap/form-system)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/form-system)
![npm](https://img.shields.io/npm/dm/@rxap/form-system)
![NPM](https://img.shields.io/npm/l/@rxap/form-system)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/form-system
```
**Install peer dependencies:**
```bash
yarn add @angular/core@^19.1.3 @angular/forms@^19.1.3 @angular/material@^19.1.1 @angular/router@^19.1.3 @rxap/data-source@^19.0.2-dev.0 @rxap/definition@^19.0.2-dev.0 @rxap/forms@^19.0.2-dev.0 @rxap/mixin@^16.0.13-dev.0 @rxap/open-api@^19.0.2-dev.0 @rxap/pattern@^1.1.12-dev.0 @rxap/reflect-metadata@^1.0.14-dev.0 @rxap/remote-method@^19.0.2-dev.0 @rxap/rxjs@^1.1.13-dev.0 @rxap/utilities@^16.4.3-dev.0 @rxap/validator@^3.0.12-dev.0 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/form-system:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/form-system:init
```
