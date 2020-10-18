@rxap-plugin/library-schematics (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap-plugin/library-schematics?style=flat-square)](https://www.npmjs.com/package/@rxap-plugin/library-schematics)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap-plugin/library-schematics)
![npm](https://img.shields.io/npm/dm/@rxap-plugin/library-schematics)
![NPM](https://img.shields.io/npm/l/@rxap-plugin/library-schematics)

> A builder to compile angular library schematics.

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:


```
yarn add @rxap-plugin/library-schematics
```


Configure @rxap-plugin/library-schematics for a project:

```
ng g @rxap-plugin/library-schematics:config [project]
```

*Add a schematics configuration and the @plugin-library-schematics:build to the specified project*

# Schematics


**Add a schematics configuration and the @plugin-library-schematics:build to the specified project**

```
ng g @rxap-plugin/library-schematics:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
skipBuild | boolean | false | Sets the default skipBuild option.
onlyBuilder | boolean | false | Whether only the builder configuration should be added.

| Required |
| --- |
| project |


# Builder


**Builds the library schematics and copy all files into the out path**

```
@rxap-plugin/library-schematics:build
```

Option | Type | Default | Description
--- | --- | --- | ---
buildTarget | string |  | The build target that where the output path is defined
tsConfig | string |  | The schematics ts config file


**Updates the package group array in the package.json**

```
@rxap-plugin/library-schematics:update-package-group
```

Option | Type | Default | Description
--- | --- | --- | ---



