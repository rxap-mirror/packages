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
browserList | array | chrome,firefox,edge | The list of browsers to run component tests against.
excludeList | array |  | The list of projects to exclude from the component test CI configuration.
cypressImage | string | cypress/included:cypress-13.3.3-node-${NODE_VERSION}-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1 | The Docker image containing Cypress to use for running tests.

## init
> init generator

```bash
nx g @rxap/plugin-gitlab-ci:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to initialize GitLab CI for.
projects | array |  | The list of projects to initialize GitLab CI for.
components | boolean | true | Whether to use GitLab CI/CD components.
componentsSource | string | component | The source for the GitLab CI/CD components.
release | string | release-it | The release strategy to use for the project.
helmChart | string |  | The path to the Helm chart project where the app version should be updated.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
onlyPackages | boolean | false | If true, initialization is tailored for a workspace containing only packages.
dte | boolean | false | Whether to use Nx Distributed Task Execution (DTE).
parallel | number | 3 | The number of parallel agents to use for DTE.
angular | boolean | false | Whether the workspace contains Angular projects.
nest | boolean | false | Whether the workspace contains NestJS projects.

## docker
> docker generator

```bash
nx g @rxap/plugin-gitlab-ci:docker
```

Option | Type | Default | Description
--- | --- | --- | ---
gcp | boolean |  | Whether to generate a Docker startup test that pulls from the GCP registry.
gitlab | boolean |  | Whether to generate a Docker startup test that pulls from the GitLab registry.
overwrite | boolean |  | Whether to overwrite existing configuration files during generation.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after generation.
components | boolean | true | Whether to use GitLab CI/CD components in the generated configuration.
tags | array |  | The list of project tags to filter for Docker configuration.
skipStartup | boolean |  | Whether to skip generating the Docker startup test.
skipE2eService | boolean |  | Whether to skip generating the E2E service configuration.
project | string |  | The name of the project to initialize GitLab CI Docker configuration for.
