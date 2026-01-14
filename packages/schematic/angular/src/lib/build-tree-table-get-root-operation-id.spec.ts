import {
  BuildNestControllerName,
  buildOperationId,
} from '@rxap/schematics-ts-morph';
import { BuildTreeTableGetRootOperationId } from './build-tree-table-get-root-operation-id';

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
  buildOperationId: jest.fn(() => 'op-id'),
}));

describe('BuildTreeTableGetRootOperationId', () => {
  it('should call buildOperationId with Correct parameters', () => {
    const options = { };
    const result = BuildTreeTableGetRootOperationId(options as any);

    expect(result).toBe('op-id');
    expect(buildOperationId).toHaveBeenCalledWith(options, 'get-root', 'NestController');
  });
});
