This package provides Angular components and services to display changelogs within an application. It fetches changelog data from a remote source and presents it in a user-friendly dialog or component, allowing users to view updates and changes. The package also includes features to remember the last viewed version and disable the changelog display.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-changelog?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-changelog)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-changelog)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-changelog)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-changelog)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-changelog
```
**Install peer dependencies:**
```bash
yarn add @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/forms@^19.1.3 @rxap/directives@^19.0.1 @rxap/environment@^19.0.1 @rxap/open-api@^19.0.1 ngx-markdown@^16.0.0 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-changelog:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-changelog:init
```
