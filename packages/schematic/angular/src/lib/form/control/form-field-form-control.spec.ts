import { BackendTypes } from '@rxap/schematic-angular';
import {
  NormalizeFormFieldFormControl,
  NormalizeFormFieldButton,
  NormalizeFormField,
  IsFormFieldFormControl,
} from './form-field-form-control';
import { FormControlKinds } from './form-control-kind';

jest.mock('./base-form-control', () => ({
  NormalizeBaseFormControl: jest.fn((c) => ({ ...c })),
}));

jest.mock('../../css-class', () => ({
  NormalizeCssClass: jest.fn((c) => c),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImportList: jest.fn((l) => l),
}));

describe('FormFieldFormControl Utilities', () => {
  describe('NormalizeFormFieldButton', () => {
    it('should normalize button with icon', () => {
      const result = NormalizeFormFieldButton({ icon: 'test' });
      expect(result?.icon).toBe('test');
      expect(result?.importList).toContainEqual(expect.objectContaining({ name: 'MatIconModule' }));
    });

    it('should return null for empty input', () => {
      expect(NormalizeFormFieldButton(null)).toBeNull();
    });
  });

  describe('NormalizeFormField', () => {
    it('should normalize form field', () => {
      const result = NormalizeFormField({ label: 'Test Label' });
      expect(result.label).toBe('Test Label');
    });
  });

  describe('NormalizeFormFieldFormControl', () => {
    it('should normalize form field control', () => {
      const control = { name: 'test', label: 'L' };
      const result = NormalizeFormFieldFormControl(control as any, undefined, undefined, undefined, undefined, undefined, { kind: BackendTypes.NONE });
      expect(result.formField.label).toBe('L');
    });
  });

  describe('IsFormFieldFormControl', () => {
    it('should return true for input kind', () => {
       expect(IsFormFieldFormControl({ kind: FormControlKinds.INPUT } as any)).toBe(true);
    });
  });
});
