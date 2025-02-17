This package provides an Angular service and interceptor to simplify integration with Keycloak, an open-source identity and access management solution. It offers features such as authentication, authorization, token management, and automatic bearer token injection for HTTP requests. The package also includes an authentication guard for Angular routes.

[![npm version](https://img.shields.io/npm/v/@rxap/keycloak?style=flat-square)](https://www.npmjs.com/package/@rxap/keycloak)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/keycloak)
![npm](https://img.shields.io/npm/dm/@rxap/keycloak)
![NPM](https://img.shields.io/npm/l/@rxap/keycloak)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/keycloak
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/router@^19.1.3 keycloak-js@^23.0.7 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/keycloak:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/keycloak:init
```
