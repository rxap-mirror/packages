Provides NestJS decorators to extract authentication information from request headers set by an OAuth2 proxy. Includes decorators for accessing the access token, email, groups, preferred username, and user ID. Also includes a generator for initializing the package.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-oauth2-proxy?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-oauth2-proxy)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-oauth2-proxy)
![npm](https://img.shields.io/npm/dm/@rxap/nest-oauth2-proxy)
![NPM](https://img.shields.io/npm/l/@rxap/nest-oauth2-proxy)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-oauth2-proxy
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common@^10.3.8 @rxap/utilities@^16.4.3-dev.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-oauth2-proxy:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-oauth2-proxy:init
```
