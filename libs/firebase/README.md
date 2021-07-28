@rxap/firebase
======

[![npm version](https://img.shields.io/npm/v/@rxap/firebase?style=flat-square)](https://www.npmjs.com/package/@rxap/firebase)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/firebase)
![npm](https://img.shields.io/npm/dm/@rxap/firebase)
![NPM](https://img.shields.io/npm/l/@rxap/firebase)

> A collection of utility angular services to interact with firebase.

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

```
ng add @rxap/firebase
```

*Setup the package @rxap/firebase for the workspace.*

# Schematics

## ng-add
> Setup the package @rxap/firebase for the workspace.

```
ng g @rxap/firebase:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The project name where firebase should be init
functions | boolean |  | Whether the project should support firebase functions
analytics | boolean |  | Whether the project should support firebase analytics
performance | boolean |  | Whether the project should support firebase performance
storage | boolean |  | Whether the project should support firebase storage
appCheck | boolean |  | Whether the project should support firebase app check
firestore | boolean |  | Whether the project should support firebase firestore
auth | boolean |  | Whether the project should support firebase auth
useEmulator | boolean |  | Whether the firebase emulator should be setup?
hostingSite | string |  | The name of the firebase hosting site


## init
> Init the select project with required angular fire imports and providers

```
ng g @rxap/firebase:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The project name where firebase should be init
functions | boolean | false | Whether the project should support firebase functions
analytics | boolean | false | Whether the project should support firebase analytics
performance | boolean | false | Whether the project should support firebase performance
storage | boolean | false | Whether the project should support firebase storage
appCheck | boolean | false | Whether the project should support firebase app check
firestore | boolean | false | Whether the project should support firebase firestore
auth | boolean | false | Whether the project should support firebase auth
useEmulator | boolean | false | Whether the firebase emulator should be setup?
hostingSite | string |  | The name of the firebase hosting site

| Required |
| --- |
| project |

