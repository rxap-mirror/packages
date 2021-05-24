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
