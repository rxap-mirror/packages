import { buildOperationId } from '@rxap/schematics-ts-morph';
import { getSubmitOperationId } from './get-submit-operation-id';

jest.mock('@rxap/schematics-ts-morph', () => ({
  buildOperationId: jest.fn(() => 'operation-id'),
}));

describe('getSubmitOperationId', () => {
  it('should call buildOperationId with correct parameters', () => {
    const options = {
      project: 'p',
      feature: 'f',
      shared: true,
      controllerName: 'ctrl',
      identifier: 'id',
      backend: { kind: 'open-api' },
    };
    const result = getSubmitOperationId(options as any);

    expect(buildOperationId).toHaveBeenCalledWith(
      { project: 'p', feature: 'f', shared: true, backend: { kind: 'open-api' } },
      'submitById',
      'ctrl'
    );
    expect(result).toBe('operation-id');
  });

  it('should use "submit" if no identifier is provided', () => {
      const options = {
          project: 'p',
          feature: 'f',
          shared: true,
          controllerName: 'ctrl',
          backend: { kind: 'open-api' },
      };
      getSubmitOperationId(options as any);

      expect(buildOperationId).toHaveBeenCalledWith(
          expect.anything(),
          'submit',
          'ctrl'
      );
  });
});
