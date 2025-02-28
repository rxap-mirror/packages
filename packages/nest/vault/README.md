A NestJS module for integrating with HashiCorp Vault. It provides a VaultService for interacting with the Vault API, including authentication, reading, writing, and managing secrets. It supports token-based and Kubernetes authentication methods, along with health checks to ensure Vault connectivity.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-vault?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-vault)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-vault)
![npm](https://img.shields.io/npm/dm/@rxap/nest-vault)
![NPM](https://img.shields.io/npm/l/@rxap/nest-vault)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-vault
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common @nestjs/config @nestjs/terminus node-vault 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-vault:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-vault:init
```
