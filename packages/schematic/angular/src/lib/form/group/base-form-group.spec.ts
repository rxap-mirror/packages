import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeBaseFormGroup } from './base-form-group';
import { AbstractControlRolls } from '../abstract-control';
import { FormGroupKind } from './form-group-kind';

jest.mock('../abstract-control', () => ({
  NormalizeAbstractControl: jest.fn((c, k) => ({ ...c, kind: k, role: AbstractControlRolls.GROUP })),
  AbstractControlRolls: { GROUP: 'group' },
}));

jest.mock('../control', () => ({
  NormalizeControlList: jest.fn((l) => l || []),
}));

describe('NormalizeBaseFormGroup', () => {
  it('should normalize base form group', () => {
    const group = { name: 'testGroup', role: AbstractControlRolls.GROUP };
    const result = NormalizeBaseFormGroup(group as any, undefined, undefined, undefined, undefined, { kind: BackendTypes.NONE });

    expect(result.role).toBe(AbstractControlRolls.GROUP);
    expect(result.kind).toBe(FormGroupKind.DEFAULT);
    expect(result.controlList).toEqual([]);
  });

  it('should include ReactiveFormsModule in importList', () => {
    const importList: any[] = [];
    NormalizeBaseFormGroup({ name: 'test' } as any, importList, undefined, undefined, undefined, { kind: BackendTypes.NONE });
    expect(importList).toContainEqual(expect.objectContaining({ name: 'ReactiveFormsModule' }));
  });
});
