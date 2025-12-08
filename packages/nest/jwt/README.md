This package provides a set of NestJS utilities for JWT (JSON Web Token) authentication and authorization. It includes guards, decorators, and a module options loader to simplify the integration of JWT-based security in NestJS applications. It allows you to easily protect your API endpoints and manage user permissions.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-jwt?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-jwt)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-jwt)
![npm](https://img.shields.io/npm/dm/@rxap/nest-jwt)
![NPM](https://img.shields.io/npm/l/@rxap/nest-jwt)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-jwt
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common @nestjs/config @nestjs/core @nestjs/cqrs @nestjs/jwt @rxap/nest-utilities @rxap/pattern rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-jwt:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-jwt:init
```
