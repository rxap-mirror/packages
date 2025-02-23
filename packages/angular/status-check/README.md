This package provides Angular components and services to check and display the status of various services. It includes a status indicator component, a status check component, a service to retrieve status information, and a guard to protect routes based on service status. It also provides utilities for configuring status check intervals and integrating with OpenAPI.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-status-check?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-status-check)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-status-check)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-status-check)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-status-check)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-status-check
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/material@^19.1.1 @angular/router@^19.1.3 @rxap/config@^19.0.2 @rxap/open-api@^19.0.2 @sentry/angular@^8.18.0 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-status-check:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-status-check:init
```
