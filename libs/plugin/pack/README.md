@rxap-plugin/pack (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap-plugin/pack?style=flat-square)](https://www.npmjs.com/package/@rxap-plugin/pack)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap-plugin/pack)
![npm](https://img.shields.io/npm/dm/@rxap-plugin/pack)
![NPM](https://img.shields.io/npm/l/@rxap-plugin/pack)

> A builder to execute a collection of architect targets in sequence.

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:


```
yarn add @rxap-plugin/pack
```


Configure @rxap-plugin/pack for a project:

```
ng g @rxap-plugin/pack:config [project]
```

*Adds the @plugin-pack:build to the specified project*

# Schematics


**Adds the @plugin-pack:build to the specified project**

```
ng g @rxap-plugin/pack:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.

| Required |
| --- |
| project |


# Builder


**build builder**

```
@rxap-plugin/pack:build
```

Option | Type | Default | Description
--- | --- | --- | ---
targets | array |  | A list of architect targets



