This package provides tools and utilities for integrating OpenAPI specifications into NestJS applications. It includes features for handling upstream API requests, managing server configurations, and generating OpenAPI documentation. It also offers interceptors and exception filters for enhanced request handling and validation.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-open-api?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-open-api)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-open-api)
![npm](https://img.shields.io/npm/dm/@rxap/nest-open-api)
![NPM](https://img.shields.io/npm/l/@rxap/nest-open-api)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-open-api
```
**Install peer dependencies:**
```bash
yarn add @nestjs/axios@^3.0.2 @nestjs/common@^10.3.8 @nestjs/config@^3.2.2 @nestjs/core@^10.3.8 @nestjs/swagger@^7.3.1 @nestjs/terminus@^10.2.3 @rxap/nest-utilities@^10.4.1-dev.1 @rxap/node-utilities@^1.3.9-dev.1 @rxap/utilities@^16.4.3-dev.0 @sentry/core@^8.18.0 class-transformer@^0.5.1 class-validator@^0.14.1 openapi-types@^10.0.0 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-open-api:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-open-api:init
```
