This package provides a comprehensive error handling solution for Angular applications, including interceptors, services, and UI components to display different types of errors in a user-friendly dialog. It supports handling of generic errors, HTTP errors with messages or codes, and OpenAPI HTTP response errors, with customizable options for logging, displaying dialogs, and integrating with Sentry. The package aims to simplify error management and improve the user experience by providing clear and informative error messages.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-error?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-error)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-error)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-error)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-error)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-error
```
**Install peer dependencies:**
```bash
yarn add @angular/cdk@^19.1.1 @angular/common@^19.1.3 @angular/core@^19.1.3 @rxap/components@^19.0.3-dev.0 @rxap/config@^19.0.2 @rxap/data-grid@^19.0.3-dev.0 @rxap/environment@^19.0.2 @rxap/open-api@^19.0.3-dev.0 @sentry/angular@^8.18.0 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-error:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-error:init
```
