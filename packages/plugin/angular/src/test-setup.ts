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

