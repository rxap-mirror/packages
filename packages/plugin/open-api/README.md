This plugin provides generators and executors for generating code from OpenAPI specifications within an Nx workspace. It allows you to initialize libraries, generate code for Angular and NestJS, and copy OpenAPI SDKs. The plugin simplifies the process of integrating OpenAPI definitions into your projects.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-open-api?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-open-api)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-open-api)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-open-api)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-open-api)

- [Installation](#installation)
- [Generators](#generators)
  - [generate](#generate)
  - [init-library](#init-library)
  - [init](#init)
- [Executors](#executors)
  - [copy-open-api-sdk](#copy-open-api-sdk)
  - [generate](#generate)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-open-api
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-open-api:init
```
# Generators

## generate
> generate generator

```bash
nx g @rxap/plugin-open-api:generate
```

## init-library
> init-library generator

```bash
nx g @rxap/plugin-open-api:init-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
external | boolean | false | 
skipFormat | boolean | false | 
persistent | boolean | false | 

## init
> Initialize the package in the workspace

```bash
nx g @rxap/plugin-open-api:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization
# Executors

## copy-open-api-sdk
> copy-open-api-sdk executor


Option | Type | Default | Description
--- | --- | --- | ---
clientSdkProject | string |  | The name of the client SDK project to copy
angular | boolean |  | Whether to copy the files for an Angular project
nestjs | boolean |  | Whether to copy the files for a NestJS project
outputDir | string | openapi | The directory to copy the files to
skipDirectives | boolean |  | Whether to skip copying the directives
skipDataSources | boolean |  | Whether to skip copying the data sources
skipRemoteMethods | boolean |  | Whether to skip copying the remote methods

## generate
> generate executor


Option | Type | Default | Description
--- | --- | --- | ---
properties |  |  | 
required |  |  | 

