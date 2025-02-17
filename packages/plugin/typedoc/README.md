A plugin for Nx workspaces to generate TypeDoc documentation. It provides executors and generators to easily integrate TypeDoc into your Nx projects. This plugin simplifies the process of creating and maintaining API documentation for your TypeScript libraries and applications.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-typedoc?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-typedoc)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-typedoc)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-typedoc)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-typedoc)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)
  - [init-library](#init-library)
  - [init-application](#init-application)
- [Executors](#executors)
  - [build](#build)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-typedoc
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-typedoc:init
```
# Generators

## init
> init generator

```bash
nx g @rxap/plugin-typedoc:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization

## init-library
> init-library generator

```bash
nx g @rxap/plugin-typedoc:init-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization

## init-application
> init-application generator

```bash
nx g @rxap/plugin-typedoc:init-application
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization
# Executors

## build
> build executor


Option | Type | Default | Description
--- | --- | --- | ---
entryPoints | array |  | 
outputPaths | array |  | 
tsconfig | string |  | 
plugins | array |  | 
json | boolean |  | 
html | boolean |  | 
skipErrorChecking | boolean | true | 
markdown | boolean |  | 
wiki | boolean |  | 

