import {
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {
  isPromise,
  isPromiseLike,
} from '@rxap/utilities';
import {
  UseFunctionConfig,
  UseFunctionType,
} from './extract-functions.mixin';

export function ApplyUseFunctionAdapters<Args extends any[], Result>(injector: Injector, fnc: UseFunctionType<any[], any>, config?: UseFunctionConfig) {
  if (config?.adapter?.result || config?.adapter?.args) {
    return function (this: any, ...args: any[]) {
      return new Promise((resolve, reject) => {
        runInInjectionContext(injector, () => {

          args    = config?.adapter?.args?.(args) ?? args;
          const result = fnc.call(this, ...(args as Args));
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

    };
  }
  return fnc;
}
