This package provides an Angular service to integrate with marker.io, a visual feedback and bug reporting tool. It allows you to easily load the marker.io widget, set custom data, and manage reporter information within your Angular application. The package also includes an init generator for setting up peer dependencies.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-marker-io?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-marker-io)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-marker-io)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-marker-io)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-marker-io)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-marker-io
```
**Install peer dependencies:**
```bash
yarn add @angular/core@^19.1.3 @marker.io/browser@^0.19.0 @rxap/config@^19.0.2-dev.2 @rxap/environment@^19.0.2-dev.1 @rxap/ngx-pub-sub@^19.0.2-dev.1 @rxap/utilities@^16.4.3-dev.1 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-marker-io:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-marker-io:init
```
