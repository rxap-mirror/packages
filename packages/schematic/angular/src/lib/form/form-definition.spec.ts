import { NormalizeFormDefinition } from './form-definition';
import { NormalizeControlList } from './control';

jest.mock('./control', () => ({
  NormalizeControlList: jest.fn((l) => l || []),
}));

describe('NormalizeFormDefinition', () => {
  it('should normalize form definition', () => {
    const result = NormalizeFormDefinition({ controlList: [] });
    expect(result.controlList).toEqual([]);
    expect(NormalizeControlList).toHaveBeenCalled();
  });
});
