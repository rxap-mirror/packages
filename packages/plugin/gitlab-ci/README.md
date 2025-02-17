This package provides generators for creating and managing GitLab CI configurations within an Nx workspace. It supports generating CI pipelines for Docker builds, component tests, and service end-to-end tests, and offers options for using local files or GitLab CI components. The package also includes generators for initializing a workspace with GitLab CI configurations, with support for different release strategies and Helm charts.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-gitlab-ci?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-gitlab-ci)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-gitlab-ci)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-gitlab-ci)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-gitlab-ci)

- [Installation](#installation)
- [Generators](#generators)
  - [component-test](#component-test)
  - [init](#init)
  - [docker](#docker)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-gitlab-ci
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-gitlab-ci:init
```
# Generators

## component-test
> component-test generator

```bash
nx g @rxap/plugin-gitlab-ci:component-test
```

Option | Type | Default | Description
--- | --- | --- | ---
browserList | array | chrome,firefox,edge | A list of browsers to test against
excludeList | array |  | A list of projects to exclude from the ci configuration
cypressImage | string | cypress/included:cypress-13.3.3-node-${NODE_VERSION}-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1 | The cypress image to use for the tests

## init
> init generator

```bash
nx g @rxap/plugin-gitlab-ci:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
components | boolean | true | If true, the gitlab ci will be initialized with components
componentsSource | string | component | 
release | string | release-it | 
helmChart | string |  | The name of the helm chart project path with namespace where the app version should be automatically updated
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
onlyPackages | boolean | false | If true, the gitlab ci will be initialized exclusively for package development
dte | boolean | false | If true, the gitlab ci will be initialized with dte execution for the targets
parallel | number | 3 | The number of parallel agents started for the nx workspace run tasks to run in the pipeline
angular | boolean | false | If true, the gitlab ci will be initialized for a workspace with angular projects
nest | boolean | false | If true, the gitlab ci will be initialized for a workspace with nest projects

## docker
> docker generator

```bash
nx g @rxap/plugin-gitlab-ci:docker
```

Option | Type | Default | Description
--- | --- | --- | ---
gcp | boolean |  | Generate docker startup test with pull target to GCP registry
gitlab | boolean |  | Generate docker startup test with pull target to gitlab registry
overwrite | boolean |  | Overwrite existing files
skipFormat | boolean | false | 
components | boolean | true | If true, the gitlab ci will be initialized with components
tags | array |  | 
skipStartup | boolean |  | 
skipE2eService | boolean |  | 
project | string |  | 
