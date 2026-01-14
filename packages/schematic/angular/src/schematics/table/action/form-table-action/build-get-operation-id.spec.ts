import { buildOperationId } from '@rxap/schematics-ts-morph';
import { buildGetOperationId } from './build-get-operation-id';

jest.mock('@rxap/schematics-ts-morph', () => ({
  buildOperationId: jest.fn(() => 'op-id'),
}));

describe('buildGetOperationId', () => {
  it('should call buildOperationId with Correct parameters', () => {
    const options = { controllerName: 'MyCtrl' };
    const result = buildGetOperationId(options as any);

    expect(result).toBe('op-id');
    expect(buildOperationId).toHaveBeenCalledWith(options, 'get', 'MyCtrl');
  });

  it('should throw if controllerName is missing', () => {
    expect(() => buildGetOperationId({} as any)).toThrow('The controller name is required');
  });
});
