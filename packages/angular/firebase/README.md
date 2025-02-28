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
yarn add @angular/common @angular/core @angular/fire @rxap/config @rxap/rxjs @rxap/utilities firebase rxjs 
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
