import '@angular/localize/init';
import { TextDecoder, TextEncoder } from 'util';
import { vi } from 'vitest';

globalThis.TextEncoder ??= TextEncoder as any;
globalThis.TextDecoder ??= TextDecoder as any;

vi.spyOn(globalThis as any, '$localize').mockImplementation((...args: any[]) => {
  // This template tag function just returns the first argument with no transformations.
  return args[0];
});
