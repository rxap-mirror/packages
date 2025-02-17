This plugin provides generators to initialize Cypress testing for Nx workspaces, with a focus on component testing for Angular applications and libraries. It automates configuration, dependency management, and code modifications to streamline Cypress setup and integration. The plugin also includes utilities for coercing configurations and dependencies to ensure compatibility and best practices.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-cypress?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-cypress)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-cypress)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-cypress)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-cypress)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [init](#init)
  - [init-library](#init-library)
  - [init-application](#init-application)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-cypress
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-cypress:init
```
# Guides

First, add the init generator to the workspace schematic configuration and create all required files

```bash
nx g @rxap/plugin-cypress:init
```

## Library

Use the cypress component configuration generator to add the required files and configurations to an angular library

```bash
nx g @nx/angular:cypress-component-configuration --buildTarget cypress:build --project $projectName
```

Use the init library generator to setup all required configurations

```bash
nx g @rxap/plugin-cypress:init-library --project $projectName
```

## Application

# Generators

## init
> init generator

```bash
nx g @rxap/plugin-cypress:init
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
nx g @rxap/plugin-cypress:init-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization
component | boolean | false | Whether to setup cypress component testing
generateTests | boolean |  | Whether to generate tests for the components
buildTarget | string |  | A build target used to configure Cypress component testing in the format of &#x60;project:target[:configuration]&#x60;. The build target should be an angular app. If not provided we will try to infer it from your projects usage.

## init-application
> init-application generator

```bash
nx g @rxap/plugin-cypress:init-application
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization
