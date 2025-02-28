This package provides internationalization (i18n) support for Angular applications, including services for language management, an HTTP interceptor for setting the &#x60;Accept-Language&#x60; header, and a language selector component. It allows you to set and manage the current language of your application, redirect users based on their language preference, and configure available languages. The package also includes an init generator to handle peer dependencies.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-localize?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-localize)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-localize)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-localize)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-localize)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-localize
```
**Install peer dependencies:**
```bash
yarn add @angular/common @angular/core @rxap/config @rxap/ngx-user rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-localize:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-localize:init
```
