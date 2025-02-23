Provides services and components to simplify the management of service worker updates in Angular applications. It includes features such as automatic updates, dialog prompts for updates, and logging of update events. The package also offers utilities to unregister service workers and initialize peer dependencies.

[![npm version](https://img.shields.io/npm/v/@rxap/service-worker?style=flat-square)](https://www.npmjs.com/package/@rxap/service-worker)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/service-worker)
![npm](https://img.shields.io/npm/dm/@rxap/service-worker)
![NPM](https://img.shields.io/npm/l/@rxap/service-worker)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/service-worker
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/service-worker@^19.1.3 @rxap/environment@^19.0.2-dev.1 @rxap/life-cycle@^19.0.2-dev.1 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/service-worker:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/service-worker:init
```
