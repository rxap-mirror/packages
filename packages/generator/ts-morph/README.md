This package provides a deprecated &#x60;AddDir&#x60; export, which is now recommended to be imported from &#x60;@rxap/workspace-ts-morph&#x60;. It also includes an init generator that helps manage peer dependencies for other &#x60;@rxap&#x60; packages, ensuring they are correctly added to either &#x60;dependencies&#x60; or &#x60;devDependencies&#x60; in the project&#x27;s &#x60;package.json&#x60;. The generator also attempts to run the init generator of the peer dependencies.

[![npm version](https://img.shields.io/npm/v/@rxap/generator-ts-morph?style=flat-square)](https://www.npmjs.com/package/@rxap/generator-ts-morph)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/generator-ts-morph)
![npm](https://img.shields.io/npm/dm/@rxap/generator-ts-morph)
![NPM](https://img.shields.io/npm/l/@rxap/generator-ts-morph)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/generator-ts-morph
```
**Execute the init generator:**
```bash
yarn nx g @rxap/generator-ts-morph:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/generator-ts-morph:init
```
