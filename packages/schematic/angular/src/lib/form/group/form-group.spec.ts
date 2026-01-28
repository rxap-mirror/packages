import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeFormGroup, IsFormGroup, IsNormalizedFormGroup } from './form-group';
import { AbstractControlRolls } from '../abstract-control';
import { NormalizeBaseFormGroup } from './base-form-group';

jest.mock('./base-form-group', () => ({
  NormalizeBaseFormGroup: jest.fn(() => 'base-group'),
}));

describe('FormGroup Multiplexer', () => {
  it('should route to NormalizeBaseFormGroup', () => {
    const result = NormalizeFormGroup({ role: AbstractControlRolls.GROUP } as any, { kind: BackendTypes.NONE });
    expect(result).toBe('base-group');
    expect(NormalizeBaseFormGroup).toHaveBeenCalled();
  });

  describe('Type Guards', () => {
    it('IsFormGroup', () => {
      expect(IsFormGroup({ role: AbstractControlRolls.GROUP } as any)).toBe(true);
      expect(IsFormGroup({ role: AbstractControlRolls.CONTROL } as any)).toBe(false);
    });
    it('IsNormalizedFormGroup', () => {
      expect(IsNormalizedFormGroup({ role: AbstractControlRolls.GROUP } as any)).toBe(true);
    });
  });
});
