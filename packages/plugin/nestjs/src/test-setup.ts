import { performance } from 'node:perf_hooks';
import {
  TextDecoder,
  TextEncoder,
} from 'node:util';

global.TextEncoder ??= TextEncoder;
global.TextDecoder ??= TextDecoder as any;


jest.doMock('@nx/devkit', () => ({
  ...jest.requireActual<any>('@nx/devkit'),
  createProjectGraphAsync: jest.fn().mockImplementation(async () => {
    return {
      nodes: {},
      dependencies: {},
    };
  }),
}));

jest.doMock('@rxap/node-utilities', () => ({
  ...jest.requireActual<any>('@rxap/node-utilities'),
  GetLatestPackageVersion: jest.fn().mockImplementation(async () => 'latest'),
}));

jest.mock('prettier', () => ({
  format: (str: string) => str,
  resolveConfig: () => Promise.resolve({}),
}));

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  performance: { value: performance },
});
