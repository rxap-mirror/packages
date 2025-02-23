This package provides a NestJS module that integrates with HashiCorp Vault to retrieve RabbitMQ credentials. It allows applications to dynamically fetch usernames and passwords for RabbitMQ from Vault, enhancing security and simplifying credential management. The module also supports automatic lease renewal for the Vault credentials.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-rabbitmq-vault?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-rabbitmq-vault)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-rabbitmq-vault)
![npm](https://img.shields.io/npm/dm/@rxap/nest-rabbitmq-vault)
![NPM](https://img.shields.io/npm/l/@rxap/nest-rabbitmq-vault)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-rabbitmq-vault
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common@^10.3.8 @nestjs/config@^3.2.2 @rxap/nest-rabbitmq@^10.1.2-dev.2 @rxap/nest-vault@^10.2.2-dev.2 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-rabbitmq-vault:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-rabbitmq-vault:init
```
