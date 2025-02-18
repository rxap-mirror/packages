Provides an Angular guard and utilities for integrating with an OAuth2 Proxy. It includes a guard to protect routes, a method to fetch user profile information, and a data source for managing the user profile. Also provides an app initializer to subscribe to logout events.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-oauth2-proxy?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-oauth2-proxy)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-oauth2-proxy)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-oauth2-proxy)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-oauth2-proxy)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-oauth2-proxy
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/router@^19.1.3 @rxap/config@^19.0.2-dev.1 @rxap/data-source@^19.0.2-dev.1 @rxap/ngx-pub-sub@^19.0.2-dev.0 @rxap/pattern@^1.1.12-dev.0 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-oauth2-proxy:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-oauth2-proxy:init
```
