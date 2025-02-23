Provides a set of utilities and base classes for building NestJS servers, including monolithic, microservice, and hybrid applications. It offers features such as environment configuration, logger integration, and setup for common middleware like cookie parsing, CORS, and Swagger. This package aims to streamline the process of setting up and configuring NestJS applications for various deployment scenarios.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-server?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-server)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-server)
![npm](https://img.shields.io/npm/dm/@rxap/nest-server)
![NPM](https://img.shields.io/npm/l/@rxap/nest-server)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-server
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common@^10.3.8 @nestjs/config@^3.2.2 @nestjs/core@^10.3.8 @nestjs/microservices@^10.3.8 @nestjs/swagger@^7.3.1 @rxap/nest-utilities@^10.4.1 @rxap/utilities@^16.4.3 cookie-parser@^1.4.6 helmet@^7.1.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-server:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-server:init
```
