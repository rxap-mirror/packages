// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};
import 'jest-preset-angular/setup-jest';
import { TextDecoder, TextEncoder } from 'util';

global.TextEncoder ??= TextEncoder as any;
global.TextDecoder ??= TextDecoder as any;
jest.spyOn(global as any, '$localize').mockImplementation((...args: any[]) => {
  // This template tag function just returns the first argument with no transformations.
  // Change this to fit your unit test needs.
  return args[0];
});
