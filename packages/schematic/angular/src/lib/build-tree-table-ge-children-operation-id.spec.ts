import {
  BuildNestControllerName,
  buildOperationId,
} from '@rxap/schematics-ts-morph';
import { BuildTreeTableGeChildrenOperationId } from './build-tree-table-ge-children-operation-id';

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
  buildOperationId: jest.fn(() => 'op-id'),
}));

describe('BuildTreeTableGeChildrenOperationId', () => {
  it('should call buildOperationId with Correct parameters', () => {
    const options = { };
    const result = BuildTreeTableGeChildrenOperationId(options as any);

    expect(result).toBe('op-id');
    expect(buildOperationId).toHaveBeenCalledWith(options, 'get-children', 'NestController');
  });
});
