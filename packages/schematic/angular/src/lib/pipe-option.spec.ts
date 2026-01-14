import { NormalizePipeOption, NormalizePipeOptionList } from './pipe-option';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((o) => o),
}));
jest.mock('./value-option', () => ({
  NormalizeValueOptionList: jest.fn((l) => l ?? []),
}));

describe('NormalizePipeOption', () => {
  it('should normalize string input with arguments', () => {
    const result = NormalizePipeOption('async:arg1:arg2');
    expect(result.name).toBe('async');
    expect(result.argumentList).toHaveLength(2);
  });

  it('should throw for unknown pipe name in string', () => {
    expect(() => NormalizePipeOption('unknown')).toThrow('Unknown pipe unknown');
  });

  it('should normalize pipe option object', () => {
    const input = { name: 'json' };
    const result = NormalizePipeOption(input as any);
    expect(result.namedImport).toBe('JsonPipe');
  });

  it('should normalize list', () => {
    const result = NormalizePipeOptionList(['json', 'async']);
    expect(result).toHaveLength(2);
  });
});
