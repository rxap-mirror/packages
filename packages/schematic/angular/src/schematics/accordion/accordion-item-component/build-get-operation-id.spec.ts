import { buildOperationId } from '@rxap/schematics-ts-morph';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { buildGetOperationId } from './build-get-operation-id';

jest.mock('@rxap/schematics-ts-morph', () => ({
  buildOperationId: jest.fn(() => 'op-id'),
}));

jest.mock('@rxap/workspace-utilities', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

describe('buildGetOperationId', () => {
  it('should call buildOperationId with Correct parameters', () => {
    const options = { identifier: 'id' };
    const result = buildGetOperationId(options as any);

    expect(result).toBe('op-id');
    expect(buildOperationId).toHaveBeenCalledWith(options, 'getById', 'NestController');
  });

  it('should use "get" if no identifier is provided', () => {
      const options = { };
      buildGetOperationId(options as any);
      expect(buildOperationId).toHaveBeenCalledWith(options, 'get', 'NestController');
  });
});
