import {
  Method,
  ToMethod,
} from '@rxap/pattern';
import { isPromiseLike } from '@rxap/utilities';
import { UseMethodConfig } from './extract-methods.mixin';

export function ApplyUseMethodAdapters(method: Method, config?: UseMethodConfig) {
  if (config?.adapter?.result || config?.adapter?.parameter) {
    return ToMethod((parameter: any, ...args: any[]) => {
      parameter    = config?.adapter?.parameter?.(parameter) ?? parameter;
      const result = method.call(parameter, ...args);
      if (isPromiseLike(result)) {
        return result.then((result: any) => {
          return config?.adapter?.result?.(result) ?? result;
        });
      }
      return config?.adapter?.result?.(result) ?? result;
    });
  }
  return method;
}
