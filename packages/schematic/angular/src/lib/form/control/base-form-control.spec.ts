import { NormalizeBaseFormControl } from './base-form-control';
import { AbstractControlRolls } from '../abstract-control';
import { FormControlKinds } from './form-control-kind';
import * as tsMorph from '@rxap/ts-morph';

jest.mock('../abstract-control', () => ({
  NormalizeAbstractControl: jest.fn((c, k) => ({ ...c, kind: k, role: 'control' })),
  AbstractControlRolls: { CONTROL: 'control' },
}));

describe('NormalizeBaseFormControl', () => {
  it('should normalize base form control', () => {
    const control = { name: 'test' };
    const result = NormalizeBaseFormControl(control as any);

    expect(result.role).toBe(AbstractControlRolls.CONTROL);
    expect(result.kind).toBe(FormControlKinds.DEFAULT);
    expect(result.label).toBeNull();
  });

  it('should include ReactiveFormsModule in importList', () => {
    const importList: any[] = [];
    NormalizeBaseFormControl({ name: 'test' } as any, importList);
    expect(importList).toContainEqual(expect.objectContaining({ name: 'ReactiveFormsModule' }));
  });
});
