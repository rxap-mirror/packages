Provides an Angular pipe that compiles Handlebars templates.  The pipe takes a template string and a context object as input. It then uses Handlebars to compile the template with the provided context, returning the rendered string.

[![npm version](https://img.shields.io/npm/v/@rxap/handlebars?style=flat-square)](https://www.npmjs.com/package/@rxap/handlebars)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/handlebars)
![npm](https://img.shields.io/npm/dm/@rxap/handlebars)
![NPM](https://img.shields.io/npm/l/@rxap/handlebars)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/handlebars
```
**Install peer dependencies:**
```bash
yarn add @angular/core 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/handlebars:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/handlebars:init
```
