import { BackendTypes } from './backend-types';
import {
  NestJsBackendOptions,
  NormalizeNestJsBackendOptions,
} from './nest-js-backend-options';

describe('NormalizeNestJsBackendOptions', () => {
  it('should normalize NestJS backend options with all properties defined', () => {
    const options: NestJsBackendOptions = {
      project: 'my-project',
      serverId: 'server123',
      module: 'AppModule',
      prefix: '/api',
      kind: BackendTypes.NESTJS
    };
    const backendContext = { feature: 'test-feature' };

    const result = NormalizeNestJsBackendOptions(options, backendContext);

    expect(result).toMatchObject({
      kind: BackendTypes.NESTJS,
      project: 'my-project',
      serverId: 'server123',
      module: 'AppModule',
      prefix: '/api',
    });
  });

  it('should normalize NestJS backend options with missing optional properties', () => {
    const options: NestJsBackendOptions = { project: 'my-project', kind: BackendTypes.NESTJS };

    const result = NormalizeNestJsBackendOptions(options);

    expect(result).toMatchObject({
      kind: BackendTypes.NESTJS,
      project: 'my-project',
      serverId: null,
      module: null,
      prefix: null,
    });
  });

  it('should handle undefined backendContext', () => {
    const options: NestJsBackendOptions = {
      project: 'my-project',
      serverId: 'server123',
      kind: BackendTypes.NESTJS
    };

    const result = NormalizeNestJsBackendOptions(options, undefined);

    expect(result).toMatchObject({
      kind: BackendTypes.NESTJS,
      project: 'my-project',
      serverId: 'server123',
      module: null,
      prefix: null,
    });
  });

  it('should prioritize default values when properties are explicitly set to undefined', () => {
    const options: NestJsBackendOptions = {
      project: undefined,
      serverId: undefined,
      module: undefined,
      prefix: undefined,
      kind: BackendTypes.NESTJS
    };

    const result = NormalizeNestJsBackendOptions(options);

    expect(result).toMatchObject({
      kind: BackendTypes.NESTJS,
      project: null,
      serverId: null,
      module: null,
      prefix: null,
    });
  });
});