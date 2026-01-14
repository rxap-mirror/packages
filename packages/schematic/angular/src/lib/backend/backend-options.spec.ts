import { NormalizeBackendOptions } from './backend-options';
import { BackendTypes } from './backend-types';
import { NormalizeBaseBackendOptions } from './base-backend-options';
import { NormalizeNestJsBackendOptions } from './nest-js-backend-options';

jest.mock('./base-backend-options', () => ({
  NormalizeBaseBackendOptions: jest.fn((o) => typeof o === 'string' ? { kind: o } : o),
}));
jest.mock('./nest-js-backend-options', () => ({
  NormalizeNestJsBackendOptions: jest.fn((o) => o),
}));

describe('NormalizeBackendOptions', () => {
  it('should route NESTJS kind to NormalizeNestJsBackendOptions', () => {
    const options = { kind: BackendTypes.NESTJS };
    NormalizeBackendOptions(options);
    expect(NormalizeNestJsBackendOptions).toHaveBeenCalledWith(options, undefined);
  });

  it('should route other kinds to NormalizeBaseBackendOptions', () => {
    const options = { kind: BackendTypes.LOCAL };
    NormalizeBackendOptions(options);
    expect(NormalizeBaseBackendOptions).toHaveBeenCalled();
  });

  it('should handle string input', () => {
    NormalizeBackendOptions(BackendTypes.NESTJS);
    expect(NormalizeBaseBackendOptions).toHaveBeenCalledWith(BackendTypes.NESTJS, undefined);
    // Since it's string, it first goes to NormalizeBaseBackendOptions, then switches
    expect(NormalizeNestJsBackendOptions).toHaveBeenCalled();
  });
});
