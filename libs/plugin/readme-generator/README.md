@rxap-plugin/readme-generator (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap-plugin/readme-generator?style=flat-square)](https://www.npmjs.com/package/@rxap-plugin/readme-generator)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap-plugin/readme-generator)
![npm](https://img.shields.io/npm/dm/@rxap-plugin/readme-generator)
![NPM](https://img.shields.io/npm/l/@rxap-plugin/readme-generator)

> A builder to generate readme files for libraries.

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:


```
yarn add @rxap-plugin/readme-generator
```


Configure @rxap-plugin/readme-generator for a project:

```
ng g @rxap-plugin/readme-generator:config [project]
```

*Adds the @rxap-plugin/readme-generator builder to the specified project.*

# Schematics


**Adds the @rxap-plugin/readme-generator builder to the specified project.**

```
ng g @rxap-plugin/readme-generator:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
type | string | library | Specify witch builder type should be added

| Required |
| --- |
| project |
| type |


# Builder


**Readme generator for plugin libraries.**

```
@rxap-plugin/readme-generator:plugin
```

Option | Type | Default | Description
--- | --- | --- | ---



