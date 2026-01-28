import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeSlideToggleFormControl, IsNormalizedSlideToggleFormControl } from './slide-toggle-form-control';
import { FormControlKinds } from './form-control-kind';

jest.mock('./base-form-control', () => ({
  NormalizeBaseFormControl: jest.fn((c, i, v, t) => ({ ...c, kind: 'checkbox', type: t })),
}));

describe('SlideToggleFormControl Utilities', () => {
  it('should normalize slide toggle form control', () => {
    const control = { name: 'test' };
    const result = NormalizeSlideToggleFormControl(control as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(FormControlKinds.CHECKBOX);
    expect(result.labelPosition).toBe('after');
  });

  describe('Type Guards', () => {
    it('IsNormalizedSlideToggleFormControl', () => {
      expect(IsNormalizedSlideToggleFormControl({ kind: FormControlKinds.CHECKBOX } as any)).toBe(true);
    });
  });
});
