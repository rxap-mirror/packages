import { BackendTypes } from './backend-types';

describe('BackendTypes', () => {
  it('should have the expected values', () => {
    expect(BackendTypes.NONE).toBe('none');
    expect(BackendTypes.NESTJS).toBe('nestjs');
    expect(BackendTypes.OPEN_API).toBe('open-api');
    expect(BackendTypes.LOCAL).toBe('local');
    expect(BackendTypes.DATA_SOURCE).toBe('data-source');
  });
});
