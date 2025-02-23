Provides Angular providers for integrating Socket.IO client functionality. It simplifies the configuration and injection of a Socket.IO client instance using tokens and dynamic configuration options. This package allows you to easily connect to a Socket.IO server within your Angular application.

[![npm version](https://img.shields.io/npm/v/@rxap/socket-io?style=flat-square)](https://www.npmjs.com/package/@rxap/socket-io)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/socket-io)
![npm](https://img.shields.io/npm/dm/@rxap/socket-io)
![NPM](https://img.shields.io/npm/l/@rxap/socket-io)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/socket-io
```
**Install peer dependencies:**
```bash
yarn add @angular/core@^19.1.3 @rxap/config@^19.0.2-dev.3 rxjs@^7.8.1 socket.io-client@^4.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/socket-io:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/socket-io:init
```
