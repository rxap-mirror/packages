This package provides tools for working with OpenAPI specifications in Angular applications. It includes services for configuring and loading OpenAPI definitions, validating requests and responses against schemas, and handling errors. It also offers utilities for building HTTP requests based on OpenAPI definitions.

[![npm version](https://img.shields.io/npm/v/@rxap/open-api?style=flat-square)](https://www.npmjs.com/package/@rxap/open-api)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/open-api)
![npm](https://img.shields.io/npm/dm/@rxap/open-api)
![NPM](https://img.shields.io/npm/l/@rxap/open-api)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/open-api
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @rxap/config@^19.0.2 @rxap/data-source@^19.0.3-dev.0 @rxap/environment@^19.0.2 @rxap/mixin@^16.0.13 @rxap/remote-method@^19.0.3-dev.0 @rxap/rxjs@^1.1.14 @rxap/utilities@^16.4.3 ajv@^8.12.0 openapi-types@^10.0.0 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/open-api:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/open-api:init
```
