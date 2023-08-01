# @rxap/plugin-angular

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-angular?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-angular)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-angular)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-angular)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-angular)

- [Installation](#installation)
- [Generators](#generators)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-angular
```
**Install peer dependencies:**
```bash
yarn add @nx/devkit@^16.5.0 @rxap/generator-utilities@^1.0.1-dev.2 @rxap/schematics-ts-morph@^16.0.0-dev.5 @rxap/workspace-ts-morph@^0.0.2-dev.0 @rxap/workspace-utilities@^0.1.0-dev.0 nx@^16.5.0 ts-morph@^18.0.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-angular:init
```
# Generators

## init
> init generator

```bash
yarn nx g @rxap/plugin-angular:init
```

## init-application
> init-application generator

```bash
yarn nx g @rxap/plugin-angular:init-application
```

## init-library
> init-library generator

```bash
yarn nx g @rxap/plugin-angular:init-library
```

## fix-schematic
> fix-schematic generator

```bash
yarn nx g @rxap/plugin-angular:fix-schematic
```

## schematic
> Create a Schematic for a project.

```bash
yarn nx g @rxap/plugin-angular:schematic
```