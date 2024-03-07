import { Injector } from '@angular/core';
import { FormDefinition } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { ApplyUseMethodAdapters } from './apply-use-method.adapters';
import { ExtractMethodsMixin } from './extract-methods.mixin';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtractMethodMixin extends ExtractMethodsMixin {
}

@Mixin(ExtractMethodsMixin)
export class ExtractMethodMixin {

  protected injector!: Injector;

  extractMethod(
    formDefinition: FormDefinition,
    controlId: string,
    name: string,
  ) {
    const map = this.extractMethods(formDefinition, controlId);
    if (!map.has(name)) {
      throw new Error(`A method with the name '${ name }' is not attached to the control '${ controlId }' use the @UseMethod decorator to attach a method to the control`);
    }
    const {method: methodToken, config} = map.get(name)!;
    const method                        = this.injector.get(methodToken);
    return ApplyUseMethodAdapters(method, config);
  }

}
