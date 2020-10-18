@rxap/kaniko (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/kaniko?style=flat-square)](https://www.npmjs.com/package/@rxap/kaniko)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/kaniko)
![npm](https://img.shields.io/npm/dm/@rxap/kaniko)
![NPM](https://img.shields.io/npm/l/@rxap/kaniko)

> 

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:


```
yarn add @rxap/kaniko
```


Configure @rxap/kaniko for a project:

```
ng g @rxap/kaniko:config [project]
```

*Adds the @rxap-plugin/kaniko:build to the specified project*

# Schematics


**Adds the @rxap-plugin/kaniko:build to the specified project**

```
ng g @rxap/kaniko:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
destination | array |  | Specify the docker image names
context | string |  | Path to context for the docker build process.
dockerfile | string |  | Path to the dockerfile.
buildTarget | string |  | The target from witch the output path can be extract.
preTarget | string |  | The target that should be execute before.
command | string |  | The command to start kaniko

| Required |
| --- |
| project |
| destination |


# Builder


**build builder**

```
@rxap/kaniko:build
```

Option | Type | Default | Description
--- | --- | --- | ---
context | string |  | The docker build context path
dockerfile | string |  | The path to the dockerfile
destination | array |  | A list of docker image tags
buildTarget | string |  | The target from witch the output path can be extract.
preTarget | string |  | The target that should be execute before.
command | string | /kaniko/executor | The command to start kaniko



