import { performance } from 'node:perf_hooks';
import {
  TextDecoder,
  TextEncoder,
} from 'node:util';

global.TextEncoder ??= TextEncoder;
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
