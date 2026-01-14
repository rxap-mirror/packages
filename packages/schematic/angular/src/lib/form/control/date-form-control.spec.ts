import { NormalizeDateFormControl, IsDateFormControlOptions, IsNormalizedDateFormControlOptions } from './date-form-control';
import { FormControlKinds } from './form-control-kind';

jest.mock('./form-field-form-control', () => ({
  NormalizeFormFieldFormControl: jest.fn((c, i, v, t) => ({ ...c, kind: 'date', type: t })),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((t) => ({ name: t || 'Date' })),
}));

describe('DateFormControl Utilities', () => {
  it('should normalize date form control', () => {
    const control = { name: 'test' };
    const result = NormalizeDateFormControl(control as any);

    expect(result.kind).toBe(FormControlKinds.DATE);
    expect(result.type.name).toBe('Date');
  });

  describe('Type Guards', () => {
    it('IsDateFormControlOptions', () => {
      expect(IsDateFormControlOptions({ kind: FormControlKinds.DATE } as any)).toBe(true);
    });
    it('IsNormalizedDateFormControlOptions', () => {
      expect(IsNormalizedDateFormControlOptions({ kind: FormControlKinds.DATE } as any)).toBe(true);
    });
  });
});
