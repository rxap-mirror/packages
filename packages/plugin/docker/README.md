This plugin provides executors and generators for building and saving Docker images within an Nx workspace. It simplifies the process of creating Dockerfiles, building images, and pushing them to registries, as well as saving images to archives. It also includes generators for configuring projects and generating GitLab CI pipelines for Docker-based applications.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-docker?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-docker)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-docker)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-docker)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-docker)

- [Installation](#installation)
- [Generators](#generators)
  - [config](#config)
  - [gitlab-ci](#gitlab-ci)
  - [init](#init)
- [Executors](#executors)
  - [build](#build)
  - [save](#save)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-docker
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-docker:init
```
**Execute the config generator to use the package with a project:**
```bash
yarn nx g @rxap/plugin-docker:config [project]
```
# Generators

## config
> Add the executor &#x27;docker&#x27; to the selected project and add generic depend on rules to nx.json

```bash
nx g @rxap/plugin-docker:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
context | string |  | Path to context for the docker build process.
dockerfile | string |  | Path to the dockerfile.
buildTarget | string |  | The target from witch the output path can be extract.
imageSuffix | string |  | A suffix added to the base image name
imageName | string |  | The base image name
imageRegistry | string |  | The image registry
command | string |  | The command to start docker
save | boolean |  | Whether to create a save target
overwrite | boolean |  | Whether to overwrite existing files

## gitlab-ci
> gitlab-ci generator

```bash
nx g @rxap/plugin-docker:gitlab-ci
```

Option | Type | Default | Description
--- | --- | --- | ---
gcp | boolean |  | Generate docker startup test with pull target to GCP registry
gitlab | boolean |  | Generate docker startup test with pull target to gitlab registry
overwrite | boolean |  | Overwrite existing files
skipFormat | boolean | false | 
tags | array |  | 

## init
> Initialize the package in the workspace

```bash
nx g @rxap/plugin-docker:init
```

Option | Type | Default | Description
--- | --- | --- | ---
skipFormat | boolean | false | 
# Executors

## build
> Executes the docker build command with the context set to the build output folder


Option | Type | Default | Description
--- | --- | --- | ---
context | string |  | The docker build context path
dockerfile | string |  | The path to the dockerfile
tag | array |  | A list of docker image tags
buildTarget | string |  | The target from witch the output path can be extract.
imageSuffix | string |  | A suffix added to the base image name
imageName | string |  | The base image name
imageRegistry | string |  | The image registry
command | string | docker | The command to start docker
latest | boolean | false | If true a destination with a latest tag is added
push | boolean | false | If true all created images are pushed
buildArgList | array |  | 

## save
> Executes the docker save command for the latest image created with the build command


Option | Type | Default | Description
--- | --- | --- | ---
outputPath | string |  | output path for the tar.gz files
imageSuffix | string |  | A suffix added to the base image name
imageName | string |  | The base image name

