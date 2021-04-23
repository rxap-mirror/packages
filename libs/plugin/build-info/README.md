@rxap/plugin-build-info (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-build-info?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-build-info)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-build-info)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-build-info)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-build-info)

> 

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:


  ```
  yarn add @rxap/plugin-build-info
  ```


Configure @rxap/plugin-build-info for a project:

```
ng g @rxap/plugin-build-info:config [project]
```

*Adds the @plugin-pack:build to the specified project*

# Schematics


  **Adds the @plugin-pack:build to the specified project**

  ```
  ng g @rxap/plugin-build-info:config
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
  @rxap/plugin-build-info:build
  ```

  Option | Type | Default | Description
  --- | --- | --- | ---
    branch | string |  | 
    tag | string |  | 
    release | string |  | 
    commit | string |  | 
    timestamp | string |  | 



