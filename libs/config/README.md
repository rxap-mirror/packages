@rxap/config
======

[![npm version](https://img.shields.io/npm/v/@rxap/config?style=flat-square)](https://www.npmjs.com/package/@rxap/config)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/config)
![npm](https://img.shields.io/npm/dm/@rxap/config)
![NPM](https://img.shields.io/npm/l/@rxap/config)

> Simple config file manager for angular applications.

- [Installation](#installation)
- [Get started](#get-started)
- [Guides](#guides)

# Installation

```
yarn add @rxap/config @rxap/utilities@^12.0.1 
```

**ng add**

```
ng add @rxap/config
```

# Get started

Update the angular application &#x60;main.ts&#x60; to support @rxap/config.

&#x60;&#x60;&#x60;

// (optional) Defines a list of configuration urls. ConfigService.Urls &#x3D; [&#x27;/config/config.json&#x27;];

// Ensures that the configuration is loaded before the angular application is started Promise.all([ConfigService.Load()]).then(() &#x3D;&gt;
platformBrowserDynamic()
.bootstrapModule(AppModule)
.catch((err) &#x3D;&gt; console.error(err))
);

&#x60;&#x60;&#x60;

# Guides

TODO


