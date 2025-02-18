This package provides generators for initializing and creating n8n plugins within an Nx workspace. It includes generators for initializing a workspace or project for n8n development, as well as a generator for creating new n8n nodes. The package also includes utilities for updating project configurations and package.json files to support n8n plugin development.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-n8n?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-n8n)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-n8n)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-n8n)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-n8n)

- [Installation](#installation)
- [Get started](#get-started)
- [Generators](#generators)
  - [init](#init)
  - [node](#node)
  - [trigger](#trigger)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-n8n
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-n8n:init
```
# Get started

## Create a new n8n package

**Create the publishable js library**
```sh
nx g @nx/js:library \
    --directory=packages/n8n/nodes/cqrs \
    --importPath=@rxap/n8n-nodes-cqrs \
    --linter=eslint \
    --name=n8n-nodes-cqrs \
    --useProjectJson=true
```

**Init the n8n library**
```sh
nx g @rxap/plugin-n8n:init --project n8n-nodes-cqrs
```

**Add a new node to the library**
```sh
nx g @rxap/plugin-n8n:node \
    --name query \
    --description "" \
    --project n8n-nodes-cqrs \
    --nodeNamePrefix ""
```

**Add a new trigger to the library**
```sh
nx g @rxap/plugin-n8n:trigger \
    --name query \
    --description "" \
    --project n8n-nodes-cqrs \
    --nodeNamePrefix ""
```

# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/plugin-n8n:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization

## node
> node generator

```bash
nx g @rxap/plugin-n8n:node
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
project | string |  | 
description | string |  | 
nodeNamePrefix | string |  | 

## trigger
> trigger generator

```bash
nx g @rxap/plugin-n8n:trigger
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
project | string |  | 
description | string |  | 
nodeNamePrefix | string |  | 
