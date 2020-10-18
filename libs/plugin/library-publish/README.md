@rxap-plugin/library-publish (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap-plugin/library-publish?style=flat-square)](https://www.npmjs.com/package/@rxap-plugin/library-publish)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap-plugin/library-publish)
![npm](https://img.shields.io/npm/dm/@rxap-plugin/library-publish)
![NPM](https://img.shields.io/npm/l/@rxap-plugin/library-publish)

> 

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:


```
yarn add @rxap-plugin/library-publish
```


Configure @rxap-plugin/library-publish for a project:

```
ng g @rxap-plugin/library-publish:config [project]
```

*Add a schematics configuration and the @rxap-plugin/library-publish:build to the specified project*

# Schematics


**Add a schematics configuration and the @rxap-plugin/library-publish:build to the specified project**

```
ng g @rxap-plugin/library-publish:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
buildTarget | boolean |  | The target which defines the out path
preTarget | boolean |  | The target that should be executed before

| Required |
| --- |
| project |


# Builder


**Publish the library**

```
@rxap-plugin/library-publish:publish
```

Option | Type | Default | Description
--- | --- | --- | ---
buildTarget | string |  | The target which defines the out path
preTarget | string |  | The target that should be execute before
registry | string |  | The target package registry



