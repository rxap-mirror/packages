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
- [Get started](#get-started)
- [Guides](#guides)

# Installation

```
yarn add @rxap/mixin @rxap/utilities@^12.0.1 
```

**ng add**
```
ng add @rxap/mixin
```

# Get started

TODO


# Guides

use the
[typescript mixin concept](https://www.typescriptlang.org/docs/handbook/mixins.html)
with ease.

#### Basic example

&#x60;&#x60;&#x60;typescript
class DisableFeature {

  // will not be mixin the Concrete class
  public disabled: boolean &#x3D; false;

  public disable(): void {
    this.disabled &#x3D; true;
  }

  public enable(): void {
    this.disabled &#x3D; false;
  }

}
&#x60;&#x60;&#x60;

&#x60;&#x60;&#x60;typescript
class ValidateFeature {

  // will not be mixin the Concrete class
  public isValid: boolean &#x3D; true;

  public get isInvalid(): boolean {
    return !this.isValid;
  }

  public validate(): void {}

}
&#x60;&#x60;&#x60;

&#x60;&#x60;&#x60;typescript
import { mixin } from &#x27;@rxap/mixin&#x27;;

interface Concrete extends DisableFeature, ValidateFeature {}

@mixin(DisableFeature, ValidateFeature)
class Concrete {
  
  // this method will not be overwritten with the
  // ValidateFeature.validate method
  public validate(): boolean {
    return true;
  }
  
}
&#x60;&#x60;&#x60;

###### Resulting Class at runtime

&#x60;&#x60;&#x60;typescript
class Concrete {
  
  public get isInvalid(): boolean {
    return !this.isValid;
  }
  
  public validate(): boolean {
    return true;
  }
  
  public disable(): void {
    this.disabled &#x3D; true;
  }

  public enable(): void {
    this.disabled &#x3D; false;
  }
  
}
&#x60;&#x60;&#x60;


