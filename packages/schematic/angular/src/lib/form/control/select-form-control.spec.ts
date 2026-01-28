import { NormalizeSelectFormControl, IsSelectFormControl, IsNormalizedSelectFormControl } from './select-form-control';
import { FormControlKinds } from './form-control-kind';
import { BackendTypes } from '../../backend/backend-types';

jest.mock('./form-field-form-control', () => ({
  NormalizeFormFieldFormControl: jest.fn((c, i, v, t, m) => ({ ...c, kind: 'select', multiple: m })),
}));

jest.mock('../../data-source/data-source-options', () => ({
  NormalizeDataSourceOptions: jest.fn((o) => o),
}));

jest.mock('../../backend/backend-options', () => ({
  NormalizeBackendOptions: jest.fn((o) => ({ kind: o })),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeUpstreamOptions: jest.fn((o) => o),
}));

describe('SelectFormControl Utilities', () => {
  it('should normalize select form control', () => {
    const control = { kind: FormControlKinds.SELECT, name: 'test', multiple: true };
    const result = NormalizeSelectFormControl(control as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(FormControlKinds.SELECT);
    expect(result.multiple).toBe(true);
  });

  it('should handle optionList', () => {
    const control = { kind: FormControlKinds.SELECT, name: 'test', optionList: [{ value: '1', label: 'One' }] };
    const result = NormalizeSelectFormControl(control as any, { kind: BackendTypes.NONE });
    expect(result.optionList).toEqual([{ value: '1', label: 'One' }]);
  });

  describe('Type Guards', () => {
    it('IsSelectFormControl', () => {
      expect(IsSelectFormControl({ kind: FormControlKinds.SELECT } as any)).toBe(true);
    });
    it('IsNormalizedSelectFormControl', () => {
      expect(IsNormalizedSelectFormControl({ kind: FormControlKinds.SELECT } as any)).toBe(true);
    });
  });
});
