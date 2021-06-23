@rxap/mixin
======

[![npm version](https://img.shields.io/npm/v/@rxap/mixin?style=flat-square)](https://www.npmjs.com/package/@rxap/mixin)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/mixin)
![npm](https://img.shields.io/npm/dm/@rxap/mixin)
![NPM](https://img.shields.io/npm/l/@rxap/mixin)

> A collection of typescript decorators.

- [Installation](#installation)
- [Guides](#guides)
- [Schematics](#schematics)

# Installation

```
ng add @rxap/mixin
```

*Setup the package @rxap/mixin for the workspace.*

# Guides

use the
[typescript mixin concept](https://www.typescriptlang.org/docs/handbook/mixins.html)
with ease.

#### Basic example

```typescript
class DisableFeature {

  // will not be mixin the Concrete class
  public disabled: boolean = false;

  public disable(): void {
    this.disabled = true;
  }

  public enable(): void {
    this.disabled = false;
  }

}
```

```typescript
class ValidateFeature {

  // will not be mixin the Concrete class
  public isValid: boolean = true;

  public get isInvalid(): boolean {
    return !this.isValid;
  }

  public validate(): void {}

}
```

```typescript
import { mixin } from '@rxap/mixin';

interface Concrete extends DisableFeature, ValidateFeature {}

@mixin(DisableFeature, ValidateFeature)
class Concrete {
  
  // this method will not be overwritten with the
  // ValidateFeature.validate method
  public validate(): boolean {
    return true;
  }
  
}
```

###### Resulting Class at runtime

```typescript
class Concrete {
  
  public get isInvalid(): boolean {
    return !this.isValid;
  }
  
  public validate(): boolean {
    return true;
  }
  
  public disable(): void {
    this.disabled = true;
  }

  public enable(): void {
    this.disabled = false;
  }
  
}
```


# Schematics

## ng-add
> Setup the package @rxap/mixin for the workspace.

```
ng g @rxap/mixin:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---


