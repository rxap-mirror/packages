A NestJS logger module that integrates with Google Cloud Logging and provides enhanced message formatting. It allows for custom print message functions and circular dependency handling. This package offers a convenient way to standardize and enrich logging within NestJS applications.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-logger?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-logger)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-logger)
![npm](https://img.shields.io/npm/dm/@rxap/nest-logger)
![NPM](https://img.shields.io/npm/l/@rxap/nest-logger)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-logger
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common@^10.3.8 @rxap/nest-utilities@^10.4.1-dev.2 @rxap/utilities@^16.4.3-dev.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-logger:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-logger:init
```
