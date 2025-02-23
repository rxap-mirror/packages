This package provides a set of tools and directives to simplify working with Angular forms, including reactive forms, custom validators, and form directives for handling loading, submitting, and error states. It offers decorators for defining forms and controls, along with utilities for building complex forms with nested groups and arrays. The library aims to enhance the development experience by providing a more structured and maintainable approach to form management in Angular applications.

[![npm version](https://img.shields.io/npm/v/@rxap/forms?style=flat-square)](https://www.npmjs.com/package/@rxap/forms)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/forms)
![npm](https://img.shields.io/npm/dm/@rxap/forms)
![NPM](https://img.shields.io/npm/l/@rxap/forms)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/forms
```
**Install peer dependencies:**
```bash
yarn add @angular/core@^19.1.3 @angular/forms@^19.1.3 @angular/router@^19.1.3 @rxap/definition@^19.0.2-dev.2 @rxap/directives@^19.0.2-dev.2 @rxap/pattern@^1.1.12-dev.1 @rxap/reflect-metadata@^1.0.14-dev.2 @rxap/rxjs@^1.1.13-dev.2 @rxap/services@^19.0.2-dev.2 @rxap/utilities@^16.4.3-dev.2 @rxap/validator@^3.0.12-dev.1 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/forms:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/forms:init
```
