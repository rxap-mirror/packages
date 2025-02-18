Provides base classes and utilities for bootstrapping Angular applications, including module-based and standalone components, with configuration loading and environment management. It offers abstractions for common setup tasks, such as dynamic module federation and environment updates. This package simplifies the initialization process for Angular projects.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-bootstrap?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-bootstrap)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-bootstrap)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-bootstrap)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-bootstrap)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-bootstrap
```
**Install peer dependencies:**
```bash
yarn add @angular/core@^19.1.3 @angular/platform-browser@^19.1.3 @angular/platform-browser-dynamic@^19.1.3 @rxap/config@^19.0.2-dev.0 @rxap/environment@^19.0.2-dev.0 ngx-logger@^5.0.12 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-bootstrap:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-bootstrap:init
```
