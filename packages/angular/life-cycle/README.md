Provides an Angular service and guard to manage application lifecycle. It allows to execute code when the application is stable and ready. Includes a guard to prevent route activation until the app is ready.

[![npm version](https://img.shields.io/npm/v/@rxap/life-cycle?style=flat-square)](https://www.npmjs.com/package/@rxap/life-cycle)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/life-cycle)
![npm](https://img.shields.io/npm/dm/@rxap/life-cycle)
![NPM](https://img.shields.io/npm/l/@rxap/life-cycle)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/life-cycle
```
**Install peer dependencies:**
```bash
yarn add @angular/core@^19.1.3 @angular/router@^19.1.3 @rxap/utilities@^16.4.2 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/life-cycle:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/life-cycle:init
```
