A NestJS cache module that utilizes MinIO as a storage adapter for Keyv. It provides a simple way to integrate MinIO with NestJS caching, allowing you to store cached data in a MinIO bucket. This package includes a Keyv adapter and a module options factory for easy configuration.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-keyv-minio?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-keyv-minio)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-keyv-minio)
![npm](https://img.shields.io/npm/dm/@rxap/nest-keyv-minio)
![NPM](https://img.shields.io/npm/l/@rxap/nest-keyv-minio)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-keyv-minio
```
**Install peer dependencies:**
```bash
yarn add @nestjs/cache-manager@^2.2.2 @nestjs/common@^10.3.8 @rxap/nest-utilities@^10.4.1 keyv@^5.1.0 minio@^8.0.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-keyv-minio:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-keyv-minio:init
```
