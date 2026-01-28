import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeFormDefinition } from './form-definition';
import { NormalizeControlList } from './control';

jest.mock('./control', () => ({
  NormalizeControlList: jest.fn((l) => l || []),
}));

describe('NormalizeFormDefinition', () => {
  it('should normalize form definition', () => {
    const result = NormalizeFormDefinition({ controlList: [] }, { kind: BackendTypes.NONE });
    expect(result.controlList).toEqual([]);
    expect(NormalizeControlList).toHaveBeenCalled();
  });
});
