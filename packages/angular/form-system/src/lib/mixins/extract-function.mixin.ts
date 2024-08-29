import { Injector } from '@angular/core';
import { FormDefinition } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { ApplyUseFunctionAdapters } from './apply-use-function.adapters';
import {
  ExtractFunctionsMixin,
  UseFunctionDefinition,
  UseFunctionType,
} from './extract-functions.mixin';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtractFunctionMixin extends ExtractFunctionsMixin {
}

@Mixin(ExtractFunctionsMixin)
export class ExtractFunctionMixin {

  protected injector!: Injector;

  extractFunction<Args extends any[], Result>(
    defaultFunction: UseFunctionType<Args, Result> | null = null,
    formDefinition: FormDefinition,
    controlId: string,
    name: string,
  ): UseFunctionType<Args, Result> {
    const map = this.extractFunctions(new Map<string, UseFunctionDefinition>, formDefinition, controlId);
    if (!map.has(name)) {
      if (defaultFunction) {
        return defaultFunction;
      }
      throw new Error(
        `A function with the name '${ name }' is not attached to the control '${ controlId }' use the @UseFunction decorator to attach a function to the control`);
    }
    const {function: fnc, config} = map.get(name)!;
    return ApplyUseFunctionAdapters<Args, Result>(this.injector, fnc, config);
  }

}
