import { NormalizeControl, NormalizeControlList } from './control';
import { AbstractControlRolls } from './abstract-control';
import { IsFormControl, NormalizeFormControl } from './control/form-control';
import { IsFormGroup, NormalizeFormGroup } from './group/form-group';
import { IsFormArray, NormalizeFormArray } from './array/form-array';

jest.mock('./control/form-control', () => ({
  IsFormControl: jest.fn(),
  NormalizeFormControl: jest.fn(() => 'form-control'),
}));
jest.mock('./group/form-group', () => ({
  IsFormGroup: jest.fn(),
  NormalizeFormGroup: jest.fn(() => 'form-group'),
}));
jest.mock('./array/form-array', () => ({
  IsFormArray: jest.fn(),
  NormalizeFormArray: jest.fn(() => 'form-array'),
}));

describe('NormalizeControl Top-Level Multiplexer', () => {
  it('should route to NormalizeFormControl', () => {
    (IsFormControl as unknown as jest.Mock).mockReturnValue(true);
    const result = NormalizeControl({ role: AbstractControlRolls.CONTROL } as any);
    expect(result).toBe('form-control');
  });

  it('should route to NormalizeFormGroup', () => {
    (IsFormControl as unknown as jest.Mock).mockReturnValue(false);
    (IsFormGroup as unknown as jest.Mock).mockReturnValue(true);
    const result = NormalizeControl({ role: AbstractControlRolls.GROUP } as any);
    expect(result).toBe('form-group');
  });

  it('should route to NormalizeFormArray', () => {
    (IsFormControl as unknown as jest.Mock).mockReturnValue(false);
    (IsFormGroup as unknown as jest.Mock).mockReturnValue(false);
    (IsFormArray as unknown as jest.Mock).mockReturnValue(true);
    const result = NormalizeControl({ role: AbstractControlRolls.ARRAY } as any);
    expect(result).toBe('form-array');
  });

  it('should throw for unknown role', () => {
    (IsFormControl as unknown as jest.Mock).mockReturnValue(false);
    (IsFormGroup as unknown as jest.Mock).mockReturnValue(false);
    (IsFormArray as unknown as jest.Mock).mockReturnValue(false);
    expect(() => NormalizeControl({ role: 'unknown' } as any)).toThrow("Unknown control role: 'unknown'");
  });
});
