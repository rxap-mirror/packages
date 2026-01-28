import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeInputFormControl, IsInputFormControlOptions, IsNormalizedInputFormControlOptions } from './input-form-control';
import { FormControlKinds } from './form-control-kind';
import * as tsMorph from '@rxap/ts-morph';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((t) => ({ name: t || 'string' })),
}));

jest.mock('./form-field-form-control', () => ({
  NormalizeFormFieldFormControl: jest.fn((c, i, v, t) => ({ ...c, kind: 'input', type: t })),
}));

describe('InputFormControl Utilities', () => {
  it('should normalize input form control', () => {
    const control = { kind: FormControlKinds.INPUT, name: 'email', inputType: 'email' };
    const result = NormalizeInputFormControl(control as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(FormControlKinds.INPUT);
    expect(result.inputType).toBe('email');
    expect(result.type.name).toBe('string');
  });

  it('should throw for unsupported input type', () => {
    const control = { kind: FormControlKinds.INPUT, name: 'test', inputType: 'file' };
    expect(() => NormalizeInputFormControl(control as any, { kind: BackendTypes.NONE })).toThrow('The input type "file" is not yet supported');
  });

  describe('Type Guards', () => {
    it('IsInputFormControlOptions', () => {
      expect(IsInputFormControlOptions({ kind: FormControlKinds.INPUT } as any)).toBe(true);
    });
    it('IsNormalizedInputFormControlOptions', () => {
      expect(IsNormalizedInputFormControlOptions({ kind: FormControlKinds.INPUT } as any)).toBe(true);
    });
  });
});
