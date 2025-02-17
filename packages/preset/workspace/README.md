This package provides generators for initializing a workspace with pre-configured settings. It includes a preset generator to set up a new workspace and an init generator to coerce peer dependencies. The preset generator leverages &#x60;@rxap/plugin-workspace&#x60; to initialize the workspace based on provided options.

[![npm version](https://img.shields.io/npm/v/@rxap/preset-workspace?style=flat-square)](https://www.npmjs.com/package/@rxap/preset-workspace)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/preset-workspace)
![npm](https://img.shields.io/npm/dm/@rxap/preset-workspace)
![NPM](https://img.shields.io/npm/l/@rxap/preset-workspace)

- [Installation](#installation)
- [Generators](#generators)
  - [preset](#preset)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/preset-workspace
```
**Execute the init generator:**
```bash
yarn nx g @rxap/preset-workspace:init
```
# Generators

## preset
> preset generator

```bash
nx g @rxap/preset-workspace:preset
```

Option | Type | Default | Description
--- | --- | --- | ---
packages | boolean |  | If true, the workspace will be initialized for package development
standalone | boolean |  | If true, the workspace will be initialized for standalone development
license | string | gpl | 
repositoryUrl | string |  | The URL of the repository
skipInstall | boolean |  | 

## init
> Initialize the package in the workspace

```bash
nx g @rxap/preset-workspace:init
```
