import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeCheckboxFormControl, IsNormalizedCheckboxFormControl } from './checkbox-form-control';
import { FormControlKinds } from './form-control-kind';

jest.mock('./base-form-control', () => ({
  NormalizeBaseFormControl: jest.fn((c, i, v, t) => ({ ...c, kind: 'checkbox', type: t })),
}));

describe('CheckboxFormControl Utilities', () => {
  it('should normalize checkbox form control', () => {
    const control = { name: 'test' };
    const result = NormalizeCheckboxFormControl(control as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(FormControlKinds.CHECKBOX);
    expect(result.labelPosition).toBe('after');
  });

  describe('Type Guards', () => {
    it('IsNormalizedCheckboxFormControl', () => {
      expect(IsNormalizedCheckboxFormControl({ kind: FormControlKinds.CHECKBOX } as any)).toBe(true);
    });
  });
});
