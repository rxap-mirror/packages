import {
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {
  Method,
  ToMethod,
} from '@rxap/pattern';
import { isPromiseLike, isPromise } from '@rxap/utilities';
import { UseMethodConfig } from './extract-methods.mixin';

export function ApplyUseMethodAdapters(injector: Injector, method: Method, config?: UseMethodConfig) {
  if (config?.adapter?.result || config?.adapter?.parameter) {
    return ToMethod((parameter: any, ...args: any[]) => {
      return new Promise((resolve, reject) => {
        runInInjectionContext(injector, () => {

          parameter    = config?.adapter?.parameter?.(parameter) ?? parameter;
          const result = method.call(parameter, ...args);
          if (isPromiseLike(result)) {
            const p = result.then((result: any) => {
              resolve(config?.adapter?.result?.(result) ?? result);
            });
            if (isPromise(p)) {
              p.catch(reject);
            }
          } else {
            try {
              resolve(config?.adapter?.result?.(result) ?? result);
            } catch (e) {
              reject(e);
            }
          }
        });

      });

    });
  }
  return method;
}
