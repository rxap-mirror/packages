import {
  InjectionToken,
  Provider,
} from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  Method,
  MethodWithParameters,
  ToMethod,
} from '@rxap/pattern';
import {
  Constructor,
  isPromise,
  noop,
} from '@rxap/utilities';

export function ProvideMethodMock<ReturnValue, Parameters>(
  method: InjectionToken<Method<ReturnValue, Parameters>> | Constructor<Method<ReturnValue, Parameters>>,
  implementation: (parameters?: Parameters, ...args: any[]) => ReturnValue | Promise<ReturnValue> = noop as any,
  delay?: number,
): Provider {
  return {
    provide: method,
    useValue: ToMethod((parameters?: Parameters, ...args: any[]) => {
      if (delay) {
        return new Promise(
          resolve => setTimeout(() => resolve(implementation(parameters, ...args)), Math.min(2147483647, delay)));
      }
      const result = implementation(parameters, ...args);
      if (isPromise(result)) {
        return result;
      }
      return Promise.resolve(result);
    }),
  };
}


export function ProvideMethodWithParametersMock<ReturnValue, Parameters>(
  method: InjectionToken<MethodWithParameters<ReturnValue, Parameters>> | Constructor<MethodWithParameters<ReturnValue, Parameters>>,
  implementation: (parameters: Parameters, ...args: any[]) => ReturnValue | Promise<ReturnValue>,
  delay?: number,
): Provider {
  return {
    provide: method,
    useValue: ToMethod((parameters?: Parameters, ...args: any[]) => {
      if (!parameters) {
        throw new Error(`Method requires a parameter`);
      }
      if (delay) {
        return new Promise(
          resolve => setTimeout(() => resolve(implementation(parameters, ...args)), Math.min(2147483647, delay)));
      }
      const result = implementation(parameters, ...args);
      if (isPromise(result)) {
        return result;
      }
      return Promise.resolve(result);
    }),
  };
}

export function ProvideRemoteMethodMock<ReturnValue, Parameters extends Record<string, any> | void, RequestBody>(
  method: InjectionToken<MethodWithParameters<ReturnValue, OpenApiRemoteMethodParameter<Parameters, RequestBody>>> | Constructor<MethodWithParameters<ReturnValue, OpenApiRemoteMethodParameter<Parameters, RequestBody>>>,
  implementation: (
    parameters: OpenApiRemoteMethodParameter<Parameters, RequestBody>,
    ...args: any[]
  ) => ReturnValue | Promise<ReturnValue>,
  delay?: number,
): Provider {
  return ProvideMethodWithParametersMock(method, implementation, delay);
}
