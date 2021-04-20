@rxap/build-info (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/build-info?style=flat-square)](https://www.npmjs.com/package/@rxap/build-info)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/build-info)
![npm](https://img.shields.io/npm/dm/@rxap/build-info)
![NPM](https://img.shields.io/npm/l/@rxap/build-info)

>

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:

  ```
  yarn add @rxap/build-info
  ```

Configure @rxap/build-info for a project:

```
ng g @rxap/build-info:config [project]
```

*Adds the @plugin-pack:build to the specified project*

# Schematics

**Adds the @plugin-pack:build to the specified project**

  ```
  ng g @rxap/build-info:config
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
  @rxap/build-info:build
  ```

Option | Type | Default | Description
  --- | --- | --- | ---
branch | string |  |
tag | string |  |
release | string |  |
commit | string |  |
timestamp | string |  | 



