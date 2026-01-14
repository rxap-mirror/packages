import { MethodKinds } from './method-kinds';

describe('MethodKinds', () => {
  it('should have the expected values', () => {
    expect(MethodKinds.DEFAULT).toBe('default');
    expect(MethodKinds.IMPORT).toBe('import');
    expect(MethodKinds.OPEN_API).toBe('open-api');
  });
});
