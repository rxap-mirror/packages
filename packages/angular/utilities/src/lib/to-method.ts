import {
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { Method } from '@rxap/pattern';
import { isPromise } from '@rxap/utilities';

export function ToMethodWithInjectionContext<ReturnType = any, Parameter = any, MethodType extends Method<ReturnType, Parameter> = Method<ReturnType, Parameter>>(
  call: ((
    parameters?: Parameter,
    ...args: any[]
  ) => Promise<ReturnType> | ReturnType),
  injector: Injector,
  metadata: any = { id: 'to-method' }
): MethodType {
  return {
    call: (parameters, ...args) => new Promise<ReturnType>((resolve, reject) => {
      if (!injector) {
        throw new Error('The injector is not defined. Can not run the method in the injection context.');
      }
      runInInjectionContext(injector, () => {
        try {
          const result = call(parameters, ...args);
          if (isPromise(result)) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (e: unknown) {
          reject(e);
        }
      });
    }),
    metadata
  } as MethodType;
}

export function ToMethodWithInjectionContextFactory<ReturnType = any, Parameter = any, MethodType extends Method<ReturnType, Parameter> = Method<ReturnType, Parameter>>(
  call: ((
    parameters?: Parameter,
    ...args: any[]
  ) => Promise<ReturnType> | ReturnType),
  metadata: any = { id: 'to-method' }
): (injector: Injector) => MethodType {
  return (injector: Injector) => {
    if (!injector) {
      throw new Error('The injector is not defined. Ensure the factory is used in conjunction with deps: [ INJECTOR ]');
    }
    return ToMethodWithInjectionContext<ReturnType, Parameter, MethodType>(
      call, injector, metadata);
  };
}
