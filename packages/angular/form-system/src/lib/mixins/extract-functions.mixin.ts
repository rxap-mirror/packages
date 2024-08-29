import { FormDefinition } from '@rxap/forms';
import {
  getMetadata,
  setMetadataMapMap,
} from '@rxap/reflect-metadata';

export const RXAP_USE_FUNCTION = 'rxap/form-system/function/use';

export type FunctionParameterAdapterFunction<Source extends any[] = any[], Target extends any[] = any[]> = (args: Source) => Target;
export type FunctionResultAdapterFunction<Source = unknown, Target = unknown> = (result: Source) => Target;

export interface UseFunctionConfig<
  ReturnTypeTarget = any,
  ArgsSource extends any[] = any[],
  ReturnTypeSource = any,
  ArgsTarget extends any[] = any[],
> {
  adapter?: {
    args?: FunctionParameterAdapterFunction<ArgsSource, ArgsTarget>;
    result?: FunctionResultAdapterFunction<ReturnTypeSource, ReturnTypeTarget>;
  };
}

export type UseFunctionType<Args extends any[], Result> = (...args: Args) => Result

export function UseFunction<Args extends any[], Result>(fnc: UseFunctionType<Args, Result>, name: string, config?: UseFunctionConfig) {
  return function (target: any, propertyKey: string) {
    setMetadataMapMap(propertyKey, name, {fnc, config}, RXAP_USE_FUNCTION, target);
  };
}

export interface UseFunctionDefinition<
  ReturnType = unknown,
  Args extends any[] = any[],
  Config extends UseFunctionConfig<ReturnType, Args> = UseFunctionConfig<ReturnType, Args>
> {
  fnc: UseFunctionType<Args, ReturnType>;
  config?: Config;
}

export class ExtractFunctionsMixin {

  protected extractFunctions(
    defaultMap: Map<string, UseFunctionDefinition> | null = null,
    formDefinition: FormDefinition,
    controlId: string,
  ): Map<string, UseFunctionDefinition> {
    const map = getMetadata<Map<string, Map<string, UseFunctionDefinition>>>(
      RXAP_USE_FUNCTION,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      if (defaultMap) {
        return defaultMap;
      }
      throw new Error(
        'Could not extract the use remote function map from the form definition instance',
      );
    }

    if (!map.has(controlId)) {
      if (defaultMap) {
        return defaultMap;
      }
      throw new Error(
        'A use remote function definition does not exists in the form definition metadata',
      );
    }

    return map.get(controlId)!;
  }

}
