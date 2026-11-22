import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
import { TextDecoder, TextEncoder } from 'util';
import '@angular/localize/init';

setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
global.TextEncoder ??= TextEncoder as any;
global.TextDecoder ??= TextDecoder as any;
jest.spyOn(global as any, '$localize').mockImplementation((...args: any[]) => {
  // This template tag function just returns the first argument with no transformations.
  // Change this to fit your unit test needs.
  return args[0];
});
