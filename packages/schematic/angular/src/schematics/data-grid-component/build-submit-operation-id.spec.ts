import {
  BuildNestControllerName,
  buildOperationId,
} from '@rxap/schematics-ts-morph';
import { buildSubmitOperationId } from './build-submit-operation-id';

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
  buildOperationId: jest.fn(() => 'op-id'),
}));

describe('buildSubmitOperationId', () => {
  it('should call buildOperationId with Correct parameters', () => {
    const options = { identifier: 'id' };
    const result = buildSubmitOperationId(options as any);

    expect(result).toBe('op-id');
    expect(buildOperationId).toHaveBeenCalledWith(options, 'submitById', 'NestController');
  });

  it('should use "submit" if no identifier is provided', () => {
      const options = { };
      buildSubmitOperationId(options as any);
      expect(buildOperationId).toHaveBeenCalledWith(options, 'submit', 'NestController');
  });
});
