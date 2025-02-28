Provides utilities and components for managing application environments in Angular, including determining environment names, release versions, and providing environment-specific configurations. It offers a component to display environment information and functions to update the environment with build details. The package also includes an init generator for setting up peer dependencies.

[![npm version](https://img.shields.io/npm/v/@rxap/environment?style=flat-square)](https://www.npmjs.com/package/@rxap/environment)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/environment)
![npm](https://img.shields.io/npm/dm/@rxap/environment)
![NPM](https://img.shields.io/npm/l/@rxap/environment)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/environment
```
**Install peer dependencies:**
```bash
yarn add @angular/common @angular/core 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/environment:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/environment:init
```
