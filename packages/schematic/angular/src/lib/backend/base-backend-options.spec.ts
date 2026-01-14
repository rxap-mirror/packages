import { NormalizeBaseBackendOptions } from './base-backend-options';
import { BackendTypes } from './backend-types';

describe('NormalizeBaseBackendOptions', () => {
  it('should return object if input is string (kind)', () => {
    const result = NormalizeBaseBackendOptions(BackendTypes.NESTJS);
    expect(result).toEqual({ kind: BackendTypes.NESTJS });
  });

  it('should return input if it is already an object', () => {
    const options = { kind: BackendTypes.LOCAL };
    const result = NormalizeBaseBackendOptions(options);
    expect(result).toBe(options);
  });
});
