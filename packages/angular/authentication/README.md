Provides authentication services, guards, and interceptors for Angular applications. It supports token-based authentication and provides features such as sign-out functionality and routing based on authentication status. This package also includes utilities for disabling authentication in certain environments and managing access tokens.

[![npm version](https://img.shields.io/npm/v/@rxap/authentication?style=flat-square)](https://www.npmjs.com/package/@rxap/authentication)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/authentication)
![npm](https://img.shields.io/npm/dm/@rxap/authentication)
![NPM](https://img.shields.io/npm/l/@rxap/authentication)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/authentication
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/router@^19.1.3 @rxap/utilities@^16.4.3-dev.0 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/authentication:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/authentication:init
```
