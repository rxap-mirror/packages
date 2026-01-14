import { NormalizeValueOption, NormalizeValueOptionList } from './value-option';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((o) => ({ name: o.name })),
}));

describe('NormalizeValueOption', () => {
  it('should normalize string input as string type if quoted', () => {
    const result = NormalizeValueOption("'test'");
    expect(result.type.name).toBe('string');
    expect(result.value).toBe('test');
    expect(result.templateValue).toBe("'test'");
  });

  it('should guess type for unquoted string', () => {
    const result = NormalizeValueOption("123");
    expect(result.type.name).toBe('string');
  });

  it('should normalize value option object', () => {
    const input = { value: 'val', type: { name: 'T' } };
    const result = NormalizeValueOption(input as any);
    expect(result.value).toBe('val');
    expect(result.type.name).toBe('T');
  });

  it('should normalize list', () => {
    const result = NormalizeValueOptionList(["'a'", "1"]);
    expect(result).toHaveLength(2);
  });
});
