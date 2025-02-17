This package provides generators and executors for initializing and managing applications within an Nx workspace. It includes features for setting up Docker configurations, managing shared service configurations, and handling internationalization. The plugin also offers utilities for updating project configurations, managing dependencies, and streamlining common application development tasks.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-application?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-application)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-application)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-application)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-application)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)
- [Executors](#executors)
  - [build-info](#build-info)
  - [i18n](#i18n)
  - [config](#config)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-application
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-application:init
```
# Generators

## init
> init generator

```bash
nx g @rxap/plugin-application:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
dockerImageName | string |  | 
dockerImageSuffix | string |  | 
dockerImageRegistry | string |  | 
overwrite | boolean | false | Whether to overwrite existing files
skipDocker | boolean |  | Whether to skip the docker configuration
skipFormat | boolean | false | 
skipProjects | boolean | false | Whether to skip executing project specific initialization
authentik | boolean | false | Whether to initialize authentik docker compose setup
standalone | boolean | false | If true, the workspace will be initialized for standalone development
minio | boolean | false | Whether to initialize minio docker compose setup
authentication |  |  | 
# Executors

## build-info
> build-info executor


Option | Type | Default | Description
--- | --- | --- | ---
branch | string |  | 
tag | string |  | 
release | string |  | 
commit | string |  | 
timestamp | string |  | 

## i18n
> i18n executor


Option | Type | Default | Description
--- | --- | --- | ---
availableLanguages | array |  | 
defaultLanguage | string |  | 
indexHtmlTemplate | string | i18n.index.html.hbs | 
buildTarget | string |  | 
assets |  |  | 

## config
> config executor


