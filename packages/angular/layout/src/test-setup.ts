import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder ??= TextEncoder as any;
global.TextDecoder ??= TextDecoder as any;

import '@angular/localize/init';
jest.spyOn(global as any, '$localize').mockImplementation((...args: any[]) => {
  // This template tag function just returns the first argument with no transformations.
  // Change this to fit your unit test needs.
  return args[0];
});

jest.mock('prettier', () => ({
  format: (str: string) => str,
  resolveConfig: () => Promise.resolve({}),
}));
