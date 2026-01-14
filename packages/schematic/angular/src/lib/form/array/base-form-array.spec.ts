import { NormalizeBaseFormArray } from './base-form-array';
import { AbstractControlRolls } from '../abstract-control';
import { FormArrayKind } from './form-array-kind';

jest.mock('../abstract-control', () => ({
  NormalizeAbstractControl: jest.fn((c, k) => ({ ...c, kind: k, role: AbstractControlRolls.ARRAY })),
  AbstractControlRolls: { ARRAY: 'array' },
}));

jest.mock('../control', () => ({
  NormalizeControlList: jest.fn((l) => l || []),
}));

jest.mock('../abstract-control-to-data-property', () => ({
  AbstractControlToDataProperty: jest.fn((c) => ({ name: c.name })),
}));

describe('NormalizeBaseFormArray', () => {
  it('should normalize base form array', () => {
    const array = { name: 'testArray', role: AbstractControlRolls.ARRAY };
    const result = NormalizeBaseFormArray(array as any);

    expect(result.role).toBe(AbstractControlRolls.ARRAY);
    expect(result.kind).toBe(FormArrayKind.DEFAULT);
    expect(result.controlList).toEqual([]);
    expect(result.isArray).toBe(true);
  });

  it('should include form system directives in importList', () => {
    const importList: any[] = [];
    NormalizeBaseFormArray({ name: 'test' } as any, importList);
    expect(importList).toContainEqual(expect.objectContaining({ name: 'ForFormArrayItemsDirective' }));
  });
});
