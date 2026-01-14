import { buildLoadFormOptions } from './build-load-form-options';
import { BackendTypes } from '../../../../lib/backend/backend-types';
import { buildGetOperationId } from './build-get-operation-id';

jest.mock('./build-get-operation-id', () => ({
  buildGetOperationId: jest.fn(() => 'get-op-id'),
}));

describe('buildLoadFormOptions', () => {
  it('should return loadFrom options for NESTJS backend', () => {
    const options = { backend: { kind: BackendTypes.NESTJS } };
    const result = buildLoadFormOptions(options as any);

    expect(result).toEqual({
      operationId: 'get-op-id',
      body: false,
      parameters: { rowId: 'rowId' },
    });
    expect(buildGetOperationId).toHaveBeenCalledWith(options);
  });

  it('should return normalizedOptions.loadFrom if not NESTJS backend', () => {
    const loadFrom = { operationId: 'other-op' };
    const options = { backend: { kind: 'other' }, loadFrom };
    const result = buildLoadFormOptions(options as any);

    expect(result).toBe(loadFrom);
  });

  it('should return undefined if not NESTJS and no loadFrom provided', () => {
      const options = { backend: { kind: 'other' } };
      const result = buildLoadFormOptions(options as any);
      expect(result).toBeUndefined();
  });
});
