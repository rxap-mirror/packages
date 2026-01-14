import { NormalizeBaseMethodOptions } from './base-method-options';
import { MethodKinds } from './method-kinds';

describe('NormalizeBaseMethodOptions', () => {
  it('should normalize with default kind', () => {
    const result = NormalizeBaseMethodOptions({} as any);
    expect(result.kind).toBe(MethodKinds.DEFAULT);
  });

  it('should preserve provided kind', () => {
    const result = NormalizeBaseMethodOptions({ kind: MethodKinds.IMPORT });
    expect(result.kind).toBe(MethodKinds.IMPORT);
  });
});
