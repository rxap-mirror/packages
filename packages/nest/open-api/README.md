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
yarn add @nestjs/axios @nestjs/common @nestjs/config @nestjs/core @nestjs/swagger @nestjs/terminus @rxap/nest-utilities @rxap/node-utilities @rxap/utilities @sentry/core class-transformer class-validator openapi-types rxjs 
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
