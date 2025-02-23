This package provides Angular modules and services to integrate with Firebase, including App Check, Messaging, and Storage. It offers providers for configuring Firebase options and emulators, as well as an HTTP interceptor for App Check. The package also includes utilities for requesting cloud messaging tokens and displaying notifications.

[![npm version](https://img.shields.io/npm/v/@rxap/firebase?style=flat-square)](https://www.npmjs.com/package/@rxap/firebase)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/firebase)
![npm](https://img.shields.io/npm/dm/@rxap/firebase)
![NPM](https://img.shields.io/npm/l/@rxap/firebase)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/firebase
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/fire@^7.5.0 @rxap/config@^19.0.2-dev.3 @rxap/rxjs@^1.1.13-dev.2 @rxap/utilities@^16.4.3-dev.2 firebase@^9.23.0 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/firebase:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/firebase:init
```
