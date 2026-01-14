import { CoerceControlComponentImports } from './coerce-control-component-imports';
import { CoerceComponentImport } from '@rxap/ts-morph';
import { IsNormalizedFormArray } from './array/form-array';
import { IsNormalizedFormGroup } from './group/form-group';

jest.mock('@rxap/ts-morph', () => ({
  CoerceComponentImport: jest.fn(),
}));

jest.mock('./array/form-array', () => ({
  IsNormalizedFormArray: jest.fn(),
}));

jest.mock('./group/form-group', () => ({
  IsNormalizedFormGroup: jest.fn(),
}));

describe('CoerceControlComponentImports', () => {
  it('should call CoerceComponentImport for each import in control', () => {
    const controls = [
      { importList: ['imp1', 'imp2'] },
    ];
    CoerceControlComponentImports('mockClass' as any, controls as any);

    expect(CoerceComponentImport).toHaveBeenCalledTimes(2);
    expect(CoerceComponentImport).toHaveBeenCalledWith('mockClass', 'imp1');
    expect(CoerceComponentImport).toHaveBeenCalledWith('mockClass', 'imp2');
  });

  it('should recurse for arrays and groups', () => {
    const innerControl = { importList: ['innerImp'] };
    const outerControl = { importList: [], controlList: [innerControl] };
    
    (IsNormalizedFormArray as unknown as jest.Mock).mockImplementation((c) => c === outerControl);
    (IsNormalizedFormGroup as unknown as jest.Mock).mockReturnValue(false);
    
    CoerceControlComponentImports('mockClass' as any, [outerControl] as any);

    expect(CoerceComponentImport).toHaveBeenCalledWith('mockClass', 'innerImp');
  });
});
