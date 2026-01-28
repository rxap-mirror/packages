import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeFormArray, IsFormArray, IsNormalizedFormArray } from './form-array';
import { AbstractControlRolls } from '../abstract-control';
import { NormalizeBaseFormArray } from './base-form-array';

jest.mock('./base-form-array', () => ({
  NormalizeBaseFormArray: jest.fn(() => 'base-array'),
}));

describe('FormArray Multiplexer', () => {
  it('should route to NormalizeBaseFormArray', () => {
    const result = NormalizeFormArray({ role: AbstractControlRolls.ARRAY } as any, { kind: BackendTypes.NONE });
    expect(result).toBe('base-array');
    expect(NormalizeBaseFormArray).toHaveBeenCalled();
  });

  describe('Type Guards', () => {
    it('IsFormArray', () => {
      expect(IsFormArray({ role: AbstractControlRolls.ARRAY } as any)).toBe(true);
      expect(IsFormArray({ role: AbstractControlRolls.CONTROL } as any)).toBe(false);
    });
    it('IsNormalizedFormArray', () => {
      expect(IsNormalizedFormArray({ role: AbstractControlRolls.ARRAY } as any)).toBe(true);
    });
  });
});
