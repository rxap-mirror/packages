import { NormalizeOpenApiMethodOptions } from './open-api-method-options';
import { MethodKinds } from './method-kinds';

describe('NormalizeOpenApiMethodOptions', () => {
  it('should normalize open api method options', () => {
    const options = { kind: MethodKinds.OPEN_API, operationId: 'testOp' };
    const result = NormalizeOpenApiMethodOptions(options);

    expect(result.kind).toBe(MethodKinds.OPEN_API);
    expect(result.operationId).toBe('testOp');
  });

  it('should throw if operationId is missing', () => {
    expect(() => NormalizeOpenApiMethodOptions({ kind: MethodKinds.OPEN_API } as any)).toThrow('The operationId property is required for an open api method');
  });
});
