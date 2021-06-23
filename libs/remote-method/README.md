@rxap/remote-method
======

[![npm version](https://img.shields.io/npm/v/@rxap/remote-method?style=flat-square)](https://www.npmjs.com/package/@rxap/remote-method)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/remote-method)
![npm](https://img.shields.io/npm/dm/@rxap/remote-method)
![NPM](https://img.shields.io/npm/l/@rxap/remote-method)

> Provides the RemoteMethod concept for RxAP.

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

```
ng add @rxap/remote-method
```

*Setup the package @rxap/remote-method for the workspace.*

# Schematics

## ng-add
> Setup the package @rxap/remote-method for the workspace.

```
ng g @rxap/remote-method:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---


## base
> create a base remote method

```
ng g @rxap/remote-method:base
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
path | string |  | 
template | boolean | false | 
collection | boolean | false | 
parametersType | string | any | 
returnType | string | any | 
export | boolean | true | 
project | string |  | 


## http
> Creates a http remote method

```
ng g @rxap/remote-method:http
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
path | string |  | 
project | string |  | 


## directive
> add a directive for the remote method

```
ng g @rxap/remote-method:directive
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
path | string |  | 
template | boolean | false | 
collection | boolean | false | 
parametersType | string | any | 
returnType | string | any | 
project | string |  | 


