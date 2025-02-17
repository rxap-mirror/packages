This package provides a collection of Nx plugins and generators for workspace management. It includes tools for initializing workspaces, managing Docker Compose configurations, fixing implicit internal dependencies, and generating CI information. The plugins and generators aim to streamline common workspace tasks and enforce consistent configurations.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-workspace?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-workspace)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-workspace)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-workspace)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-workspace)

- [Installation](#installation)
- [Generators](#generators)
  - [docker-compose](#docker-compose)
  - [init](#init)
  - [project-target](#project-target)
  - [fix-implicit-internal-dependencies](#fix-implicit-internal-dependencies)
  - [rename](#rename)
- [Executors](#executors)
  - [ci-info](#ci-info)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-workspace
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-workspace:init
```
# Generators

## docker-compose
> docker-compose generator

```bash
nx g @rxap/plugin-workspace:docker-compose
```

Option | Type | Default | Description
--- | --- | --- | ---
tags | array |  | The tags a project needs to be used to generate docker compose service
ignoreProjects | array |  | The projects to ignore when generating docker compose service
skipFormat | boolean | false | 
serviceEnvironments | array |  | The environment variables to be used in docker compose service
rootDomain | string |  | The root domain to be used in docker compose service
middlewares | array |  | The traefik middlewares to be add to each service

## init
> init generator

```bash
nx g @rxap/plugin-workspace:init
```

Option | Type | Default | Description
--- | --- | --- | ---
packages | boolean | false | If true, the workspace will be initialized for package development
fullStack | boolean | false | If true, the workspace will be initialized for full stack application development
standalone | boolean | false | If true, the workspace will be initialized for standalone development
overwrite | boolean | false | Whether to overwrite existing files
skipFormat | boolean | false | 
skipProjects | boolean | false | Whether to skip executing project specific initialization
skipLicense | boolean | false | Whether to skip adding a license file
license | string | gpl | 
repositoryUrl | string |  | The URL of the repository

## project-target
> project-target generator

```bash
nx g @rxap/plugin-workspace:project-target
```

Option | Type | Default | Description
--- | --- | --- | ---
projects | array |  | 
overwrite | boolean | false | Whether to overwrite existing files
cleanup | boolean | false | remove if empty object for any configuration and the options property. After configuration cleanup
simplify | boolean | false | if the property for the target is equal to the default from the nx.json then remove the property
reorder | boolean | false | reorder all target properties to be in alphabetic order
project | string |  | 

## fix-implicit-internal-dependencies
> fix-implicit-internal-dependencies generator

```bash
nx g @rxap/plugin-workspace:fix-implicit-internal-dependencies
```

Option | Type | Default | Description
--- | --- | --- | ---
projects | array |  | 
project | string |  | 

## rename
> rename generator

```bash
nx g @rxap/plugin-workspace:rename
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of project that should be renamed
name | string |  | The new name of the project
tags | array |  | 
# Executors

## ci-info
> ci-info executor


Option | Type | Default | Description
--- | --- | --- | ---
branch | string |  | 
tag | string |  | 
release | string |  | 
commit | string |  | 
timestamp | string |  | 

