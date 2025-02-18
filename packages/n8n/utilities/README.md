This package provides utility functions and classes for n8n nodes, including custom authentication methods (Bearer Auth, Oauth2 Proxy Auth, Base URL), a decorator for capturing execution errors, and base classes for creating nodes from OpenAPI specifications. It simplifies the process of building and integrating with REST APIs within the n8n workflow automation platform. The package offers tools for defining node properties based on OpenAPI schemas and handling different request body types.

[![npm version](https://img.shields.io/npm/v/@rxap/n8n-utilities?style=flat-square)](https://www.npmjs.com/package/@rxap/n8n-utilities)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/n8n-utilities)
![npm](https://img.shields.io/npm/dm/@rxap/n8n-utilities)
![NPM](https://img.shields.io/npm/l/@rxap/n8n-utilities)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/n8n-utilities
```
**Install peer dependencies:**
```bash
yarn add n8n-workflow@^1.48.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/n8n-utilities:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/n8n-utilities:init
```
