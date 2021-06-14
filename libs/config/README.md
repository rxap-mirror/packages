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

# Installation

```
yarn add @rxap/config @rxap/utilities@^12.0.3
```

# Get started

Update the angular application `main.ts` to support @rxap/config.

```

// (optional) Defines a list of configuration urls.
ConfigService.Urls = ['/config/config.json'];

// Ensures that the configuration is loaded before the angular application is  started
Promise.all([ConfigService.Load()]).then(() =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err))
);

```


