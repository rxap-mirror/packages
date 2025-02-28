This package provides an authentication guard and service for Angular applications using OAuth 2.0 and OpenID Connect. It simplifies the integration of authentication flows, including sign-in, sign-out, and token management, with support for disabled authentication scenarios. The package also includes a provider function to streamline configuration.

[![npm version](https://img.shields.io/npm/v/@rxap/oauth?style=flat-square)](https://www.npmjs.com/package/@rxap/oauth)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/oauth)
![npm](https://img.shields.io/npm/dm/@rxap/oauth)
![NPM](https://img.shields.io/npm/l/@rxap/oauth)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/oauth
```
**Install peer dependencies:**
```bash
yarn add @angular/core @angular/router @rxap/authentication @rxap/rxjs angular-oauth2-oidc angular-oauth2-oidc-jwks rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/oauth:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/oauth:init
```
