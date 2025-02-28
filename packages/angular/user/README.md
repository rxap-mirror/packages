Provides Angular services and data sources for managing user settings such as dark mode, language, and theme preferences. It uses Rxap data sources and Open API remote methods to interact with a user settings API. The package also includes components and utilities for managing theme density and typography.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-user?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-user)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-user)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-user)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-user)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-user
```
**Install peer dependencies:**
```bash
yarn add @angular/core @rxap/data-source @rxap/ngx-pub-sub @rxap/open-api @rxap/utilities rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-user:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-user:init
```
