import { ProviderToken } from '@angular/core';
import { FormDefinition } from '@rxap/forms';
import { Method } from '@rxap/pattern';
import {
  getMetadata,
  setMetadataMapMap,
} from '@rxap/reflect-metadata';

export const RXAP_USE_METHOD = 'rxap/form-system/method/use';

export type MethodParameterAdapterFunction<Source = unknown, Target = unknown> = (parameter: Source) => Target;
export type MethodResultAdapterFunction<Source = unknown, Target = unknown> = (result: Source) => Target;

export interface UseMethodConfig<
  ReturnTypeTarget = any,
  ParameterSource = any,
  ReturnTypeSource = any,
  ParameterTarget = any,
> {
  adapter?: {
    parameter?: MethodParameterAdapterFunction<ParameterSource, ParameterTarget>;
    result?: MethodResultAdapterFunction<ReturnTypeSource, ReturnTypeTarget>;
  };
}

export function UseMethod(method: ProviderToken<Method>, name: string, config?: UseMethodConfig) {
  return function (target: any, propertyKey: string) {
    setMetadataMapMap(propertyKey, name, {method, config}, RXAP_USE_METHOD, target);
  };
}

export interface UseMethodDefinition<
  ReturnType = unknown,
  Parameter = unknown,
  Config extends UseMethodConfig<ReturnType, Parameter> = UseMethodConfig<ReturnType, Parameter>
> {
  method: ProviderToken<Method<ReturnType, Parameter>>;
  config?: Config;
}

export class ExtractMethodsMixin {

  protected extractMethods(
    formDefinition: FormDefinition,
    controlId: string,
  ): Map<string, UseMethodDefinition> {
    const map = getMetadata<Map<string, Map<string, UseMethodDefinition>>>(
      RXAP_USE_METHOD,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      console.log(map);
      throw new Error(
        'Could not extract the use remote method map from the form definition instance',
      );
    }

    if (!map.has(controlId)) {
      throw new Error(
        'A use remote method definition does not exists in the form definition metadata',
      );
    }

    return map.get(controlId)!;
  }

}
