This package provides Firebase integration for NestJS applications. It includes modules, guards, and decorators for Firebase Authentication and App Check, as well as utilities for Firestore error handling. It simplifies the process of securing and managing Firebase-related functionalities within a NestJS application.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-firebase?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-firebase)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-firebase)
![npm](https://img.shields.io/npm/dm/@rxap/nest-firebase)
![NPM](https://img.shields.io/npm/l/@rxap/nest-firebase)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-firebase
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common@^10.3.8 firebase-admin@^10.3.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-firebase:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-firebase:init
```
