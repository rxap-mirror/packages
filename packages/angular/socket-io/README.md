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
npm install @rxap/socket-io
```
With pnpm or yarn use `pnpm add` or `yarn add` instead of `npm install`.

**Install peer dependencies:**
```bash
npm install @angular/core @rxap/config socket.io-client 
```
**Execute the init generator:**
```bash
nx g @rxap/socket-io:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/socket-io:init
```
