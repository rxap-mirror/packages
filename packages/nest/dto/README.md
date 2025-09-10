This package provides a set of reusable DTOs (Data Transfer Objects) and utilities for NestJS applications, leveraging class-transformer and class-validator for data validation and transformation. It includes base DTOs for common use cases like UUIDs, icons, and paginated data, along with options for configuring class-transformer and class-validator. It also offers a utility function to easily create DTO instances from plain objects with validation.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-dto?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-dto)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-dto)
![npm](https://img.shields.io/npm/dm/@rxap/nest-dto)
![NPM](https://img.shields.io/npm/l/@rxap/nest-dto)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-dto
```
**Install peer dependencies:**
```bash
yarn add class-transformer class-validator 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-dto:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-dto:init
```
