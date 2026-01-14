import { NormalizeMatFormFieldDefaultOptions, MatFormFieldAppearance } from './mat-form-field-default-options';

describe('NormalizeMatFormFieldDefaultOptions', () => {
  it('should return null for empty input', () => {
    expect(NormalizeMatFormFieldDefaultOptions()).toBeNull();
    expect(NormalizeMatFormFieldDefaultOptions({} as any)).toBeNull();
  });

  it('should normalize form field options', () => {
    const input = { appearance: MatFormFieldAppearance.Fill };
    const result = NormalizeMatFormFieldDefaultOptions(input as any);
    expect(result!.appearance).toBe(MatFormFieldAppearance.Fill);
  });
});
