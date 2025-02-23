Provides an Angular module and directives to manage authorization and permissions in your application. It allows you to control the visibility and enabled state of UI elements based on user permissions. The package includes an &#x60;AuthorizationService&#x60; to check permissions and directives to easily integrate permission checks into your templates and components.

[![npm version](https://img.shields.io/npm/v/@rxap/authorization?style=flat-square)](https://www.npmjs.com/package/@rxap/authorization)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/authorization)
![npm](https://img.shields.io/npm/dm/@rxap/authorization)
![NPM](https://img.shields.io/npm/l/@rxap/authorization)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/authorization
```
**Install peer dependencies:**
```bash
yarn add @angular/core@^19.1.3 @angular/forms@^19.1.3 @angular/material@^19.1.1 @rxap/utilities@^16.4.3 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/authorization:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/authorization:init
```
