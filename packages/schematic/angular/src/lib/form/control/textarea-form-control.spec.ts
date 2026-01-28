import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeTextareaFormControl, IsTextareaFormControlOptions, IsNormalizedTextareaFormControlOptions, NormalizeTextareaAutosize } from './textarea-form-control';
import { FormControlKinds } from './form-control-kind';

jest.mock('./form-field-form-control', () => ({
  NormalizeFormFieldFormControl: jest.fn((c, i, v, t) => ({ ...c, kind: 'textarea', type: t })),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((t) => ({ name: t || 'string' })),
}));

describe('TextareaFormControl Utilities', () => {
  describe('NormalizeTextareaAutosize', () => {
    it('should normalize autosize options', () => {
      const result = NormalizeTextareaAutosize({ minRows: 2 });
      expect(result?.minRows).toBe(2);
      expect(result?.maxRows).toBeNull();
    });

    it('should return null for empty input', () => {
      expect(NormalizeTextareaAutosize({})).toBeNull();
    });
  });

  describe('NormalizeTextareaFormControl', () => {
    it('should normalize textarea form control', () => {
      const control = { name: 'test', autosize: { minRows: 2 } };
      const result = NormalizeTextareaFormControl(control as any, { kind: BackendTypes.NONE });

      expect(result.kind).toBe(FormControlKinds.TEXTAREA);
      expect(result.autosize?.minRows).toBe(2);
    });
  });

  describe('Type Guards', () => {
    it('IsTextareaFormControlOptions', () => {
      expect(IsTextareaFormControlOptions({ kind: FormControlKinds.TEXTAREA } as any)).toBe(true);
    });
    it('IsNormalizedTextareaFormControlOptions', () => {
      expect(IsNormalizedTextareaFormControlOptions({ kind: FormControlKinds.TEXTAREA } as any)).toBe(true);
    });
  });
});
