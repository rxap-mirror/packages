import { vi } from 'vitest';

import { TextDecoder, TextEncoder } from 'util';
import '@angular/localize/init';

globalThis.TextEncoder ??= TextEncoder as any;
globalThis.TextDecoder ??= TextDecoder as any;

vi.spyOn(globalThis as any, '$localize').mockImplementation((...args: any[]) => {
  // This template tag function just returns the first argument with no transformations.
  // Change this to fit your unit test needs.
  return args[0];
});
