This package provides generators for initializing Angular projects with pre-configured settings. It leverages other &#x60;@rxap&#x60; plugins to set up workspace and Angular-specific configurations, including options for package management, standalone components, license, and repository URL. It aims to streamline the setup process for new Angular projects.

[![npm version](https://img.shields.io/npm/v/@rxap/preset-angular?style=flat-square)](https://www.npmjs.com/package/@rxap/preset-angular)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/preset-angular)
![npm](https://img.shields.io/npm/dm/@rxap/preset-angular)
![NPM](https://img.shields.io/npm/l/@rxap/preset-angular)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [preset](#preset)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/preset-angular
```
**Execute the init generator:**
```bash
yarn nx g @rxap/preset-angular:init
```
# Guides

# Create a new workspace

To create a new workspace, run the following command:

```bash
WORKSPACE_NAME=my-workspace
yarn create nx-workspace --preset @rxap/preset-angular --pm yarn --name $WORKSPACE_NAME
```

Navigate to the newly created workspace and run the yarn install command:

```bash
cd $WORKSPACE_NAME
yarn
```

# Generators

## preset
> preset generator

```bash
nx g @rxap/preset-angular:preset
```

Option | Type | Default | Description
--- | --- | --- | ---
packages | boolean |  | If true, the workspace will be initialized for package development
standalone | boolean |  | If true, the workspace will be initialized for standalone development
skipInstall | boolean |  | 
license | string | gpl | 
repositoryUrl | string |  | The URL of the repository
prefix | string |  | The prefix for the angular components

## init
> Initialize the package in the workspace

```bash
nx g @rxap/preset-angular:init
```
