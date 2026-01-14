import {
  BuildNestControllerName,
  buildOperationId,
} from '@rxap/schematics-ts-morph';
import { buildOptionsOperationId } from './build-options-operation-id';
import { buildOptionsOperationName } from './build-options-operation-name';

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
  buildOperationId: jest.fn(() => 'op-id'),
}));

jest.mock('./build-options-operation-name', () => ({
  buildOptionsOperationName: jest.fn(() => 'op-name'),
}));

describe('buildOptionsOperationId', () => {
  it('should return correct operation id', () => {
    const options = { };
    expect(buildOptionsOperationId(options as any)).toBe('op-id');
    expect(buildOperationId).toHaveBeenCalledWith(options, 'op-name', 'NestController');
  });
});
