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

  it.each([
    [ 'checkbox', 'boolean' ],
    [ 'text', 'string' ],
    [ 'password', 'string' ],
    [ 'color', 'string' ],
    [ 'email', 'string' ],
    [ 'tel', 'string' ],
    [ 'url', 'string' ],
    [ 'number', 'number' ],
    [ 'date', 'Date' ],
    [ 'time', 'Date' ],
    [ 'datetime-local', 'Date' ],
  ])('should map the %s input type to the %s type', (inputType, type) => {
    const result = NormalizeInputFormControl({ kind: FormControlKinds.INPUT, name: 'x', inputType } as any, { kind: BackendTypes.NONE });
    expect(result.type.name).toBe(type);
    expect(result.inputType).toBe(inputType);
  });

  it.each([ 'email', 'tel', 'url', 'date' ])('should add a validator for the %s input type', inputType => {
    const validatorList: string[] = [];
    NormalizeInputFormControl({ kind: FormControlKinds.INPUT, name: 'x', inputType, validatorList } as any, { kind: BackendTypes.NONE });
    expect(validatorList).toHaveLength(1);
  });

  it('should default to a text input without placeholder', () => {
    const result = NormalizeInputFormControl({ kind: FormControlKinds.INPUT, name: 'x' } as any, { kind: BackendTypes.NONE });
    expect(result.inputType).toBe('text');
    expect(result.placeholder).toBeNull();
  });

  it.each([ 'hidden', 'image', 'month', 'radio', 'reset', 'button', 'search', 'submit', 'week', 'range' ])('should throw for the unsupported %s input type', inputType => {
    expect(() => NormalizeInputFormControl({ kind: FormControlKinds.INPUT, name: 'x', inputType } as any, { kind: BackendTypes.NONE })).toThrow('not yet supported');
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
