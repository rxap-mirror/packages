This package provides a set of reusable Angular components, including a navigate back button, a JSON viewer, an empty router outlet, a copy-to-clipboard button and component, and a confirmation dialog with directive and module. These components are designed to simplify common UI tasks and improve the user experience in Angular applications. The package also includes an init generator for use with Nx workspaces.

[![npm version](https://img.shields.io/npm/v/@rxap/components?style=flat-square)](https://www.npmjs.com/package/@rxap/components)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/components)
![npm](https://img.shields.io/npm/dm/@rxap/components)
![NPM](https://img.shields.io/npm/l/@rxap/components)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/components
```
**Install peer dependencies:**
```bash
yarn add @angular/cdk @angular/common @angular/core @angular/material @angular/router @rxap/rxjs @rxap/utilities rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/components:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/components:init
```
