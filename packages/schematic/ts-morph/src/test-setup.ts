import { performance } from 'node:perf_hooks';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder ??= TextEncoder as any;
global.TextDecoder ??= TextDecoder as any;

jest.mock('prettier', () => ({
  format: (str: string) => str,
  resolveConfig: () => Promise.resolve({}),
  getFileInfo: () => ({ ignored: true })
}));

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  performance: { value: performance },
});