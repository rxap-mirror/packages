NestJS module for interacting with web3.storage. It provides a service for uploading and retrieving data from the decentralized web using the web3.storage service. The module can be configured using the NestJS config service.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-web3-storage?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-web3-storage)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-web3-storage)
![npm](https://img.shields.io/npm/dm/@rxap/nest-web3-storage)
![NPM](https://img.shields.io/npm/l/@rxap/nest-web3-storage)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-web3-storage
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common@^10.3.8 @nestjs/config@^3.2.2 web3.storage@^4.5.5 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-web3-storage:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-web3-storage:init
```
