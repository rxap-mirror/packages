import { buildOperationId } from '@rxap/schematics-ts-morph';
import { buildGetOperationId } from './build-get-operation-id';

jest.mock('@rxap/schematics-ts-morph', () => ({
  buildOperationId: jest.fn(() => 'op-id'),
}));

describe('buildGetOperationId', () => {
  it('should call buildOperationId with Correct parameters', () => {
    const options = { controllerName: 'MyCtrl', identifier: 'id' };
    const result = buildGetOperationId(options as any);

    expect(result).toBe('op-id');
    expect(buildOperationId).toHaveBeenCalledWith(options, 'getById', 'MyCtrl');
  });

  it('should use "get" if no identifier is provided', () => {
      const options = { controllerName: 'MyCtrl' };
      buildGetOperationId(options as any);
      expect(buildOperationId).toHaveBeenCalledWith(options, 'get', 'MyCtrl');
  });
});
