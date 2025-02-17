Provides a simple publish/subscribe service for Angular applications. It supports caching of messages with optional retention policies and a garbage collector to manage the cache size.  The service also supports wildcard topic matching.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-pub-sub?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-pub-sub)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-pub-sub)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-pub-sub)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-pub-sub)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-pub-sub
```
**Install peer dependencies:**
```bash
yarn add @angular/core@^19.1.3 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-pub-sub:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-pub-sub:init
```
