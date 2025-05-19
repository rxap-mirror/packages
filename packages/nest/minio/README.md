NestJS module for integrating with Minio object storage. It provides a service for interacting with Minio, a configurable module builder, and a health indicator for monitoring Minio&#x27;s status. The module also includes options loader for configuration.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-minio?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-minio)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-minio)
![npm](https://img.shields.io/npm/dm/@rxap/nest-minio)
![NPM](https://img.shields.io/npm/l/@rxap/nest-minio)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-minio
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common @nestjs/config @nestjs/terminus @rxap/nest-utilities joi minio 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-minio:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-minio:init
```
