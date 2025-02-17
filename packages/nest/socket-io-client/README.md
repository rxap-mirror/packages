This package provides a NestJS module for integrating a Socket.IO client. It offers a client proxy service and a provider for managing the Socket.IO client connection, allowing NestJS applications to easily interact with Socket.IO servers.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-socket-io-client?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-socket-io-client)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-socket-io-client)
![npm](https://img.shields.io/npm/dm/@rxap/nest-socket-io-client)
![NPM](https://img.shields.io/npm/l/@rxap/nest-socket-io-client)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-socket-io-client
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common@^10.3.8 @nestjs/config@^3.2.2 @nestjs/microservices@^10.3.8 rxjs@^7.8.1 socket.io-client@^4.6.2 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-socket-io-client:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-socket-io-client:init
```
