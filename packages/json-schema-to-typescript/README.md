Generate TypeScript interfaces from JSON Schema definitions. It allows you to programmatically create and manipulate TypeScript interface definitions based on JSON schema inputs. The package provides utilities to convert JSON schema to TypeScript interfaces, handle references, and manage imports.

[![npm version](https://img.shields.io/npm/v/@rxap/json-schema-to-typescript?style=flat-square)](https://www.npmjs.com/package/@rxap/json-schema-to-typescript)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/json-schema-to-typescript)
![npm](https://img.shields.io/npm/dm/@rxap/json-schema-to-typescript)
![NPM](https://img.shields.io/npm/l/@rxap/json-schema-to-typescript)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)
  - [generate](#generate)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/json-schema-to-typescript
```
**Execute the init generator:**
```bash
yarn nx g @rxap/json-schema-to-typescript:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/json-schema-to-typescript:init
```

## generate
> Generate a typescript interface for a given json schema

```bash
nx g @rxap/json-schema-to-typescript:generate
```

Option | Type | Default | Description
--- | --- | --- | ---
path | string |  | Path to the json schema file
output | string |  | Path to the output typescript file. Defaults to the filename of the json schema where .json is replaced by .d.ts
suffix | string |  | Suffix of the generate interface name
