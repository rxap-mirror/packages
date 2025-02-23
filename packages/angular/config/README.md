Provides a configuration service for Angular applications, allowing you to load and manage application settings from various sources such as static files, URLs, local storage, and URL parameters. It supports schema validation and provides utilities for accessing configuration values. This package also includes testing utilities for mocking and managing configurations in test environments.

[![npm version](https://img.shields.io/npm/v/@rxap/config?style=flat-square)](https://www.npmjs.com/package/@rxap/config)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/config)
![npm](https://img.shields.io/npm/dm/@rxap/config)
![NPM](https://img.shields.io/npm/l/@rxap/config)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/config
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @rxap/environment@^19.0.2 @rxap/utilities@^16.4.3 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/config:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/config:init
```
