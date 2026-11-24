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
npm install @rxap/ngx-marker-io
```
With pnpm or yarn use `pnpm add` or `yarn add` instead of `npm install`.

**Install peer dependencies:**
```bash
npm install @angular/core @marker.io/browser @rxap/config @rxap/environment @rxap/ngx-pub-sub @rxap/utilities rxjs 
```
**Execute the init generator:**
```bash
nx g @rxap/ngx-marker-io:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-marker-io:init
```
