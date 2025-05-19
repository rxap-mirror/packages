Provides utility functions, pipes, interceptors, modules, and configuration options to enhance NestJS applications. It includes features for filtering, sorting, paging, environment configuration, validation, logging, and more. This package aims to simplify common tasks and promote best practices in NestJS development.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-utilities?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-utilities)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-utilities)
![npm](https://img.shields.io/npm/dm/@rxap/nest-utilities)
![NPM](https://img.shields.io/npm/l/@rxap/nest-utilities)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-utilities
```
**Install peer dependencies:**
```bash
yarn add @nestjs/cache-manager @nestjs/common @nestjs/config @nestjs/core @nestjs/throttler @rxap/utilities class-transformer class-validator joi rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-utilities:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-utilities:init
```
