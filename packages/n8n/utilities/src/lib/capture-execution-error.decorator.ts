import { isPromise } from '@rxap/utilities';
import {
  IExecuteFunctions,
  INodeExecutionData,
} from 'n8n-workflow';

export function CaptureExecutionError() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: IExecuteFunctions, ...args: any[]) {
      // Call the original method with the correct 'this' context
      const result = originalMethod.apply(this, args);

      // Check if the result is a Promise
      if (result && isPromise(result)) {
        if (this.continueOnFail()) {
          return result.catch((error: any) => {
            const payload = { json: error, error };
            return [ [ payload ] ];
          });
        } else {
          return result.then((output: INodeExecutionData[][]) => {
            if (output.some(item => item?.some(item => item?.error))) {
              throw output.find(item => item.some(item => item.error))!.find(item => item.error)!.error;
            }
            return output;
          })
        }
      } else {
        // If it's not a Promise, return the result directly
        return result;
      }
    };

    return descriptor;
  }
}
