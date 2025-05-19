This package provides a Sentry integration for NestJS applications. It includes a logger, interceptor, and module to simplify error tracking and performance monitoring with Sentry. It offers configurable options for setting up Sentry in your NestJS application.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-sentry?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-sentry)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-sentry)
![npm](https://img.shields.io/npm/dm/@rxap/nest-sentry)
![NPM](https://img.shields.io/npm/l/@rxap/nest-sentry)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-sentry
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common @nestjs/config @nestjs/core @rxap/nest-logger @rxap/nest-utilities @sentry/core @sentry/nestjs @sentry/node @sentry/profiling-node @sentry/types @sentry/utils joi rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-sentry:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-sentry:init
```
