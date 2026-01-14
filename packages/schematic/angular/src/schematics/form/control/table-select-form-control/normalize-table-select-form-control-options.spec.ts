import { NormalizeTableSelectFormControl } from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import { NormalizeFormControlOptions } from '../../form-control/normalize-form-control-options';
import { NormalizeTableSelectFormControlOptions } from './normalize-table-select-form-control-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeTableSelectFormControl: jest.fn((o) => ({ ...o, kind: 'table-select' })),
}));

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

jest.mock('../../form-control/normalize-form-control-options', () => ({
  NormalizeFormControlOptions: jest.fn((o) => ({ ...o, formName: 'testForm' })),
}));

describe('NormalizeTableSelectFormControlOptions', () => {
  it('should normalize table select form control options', () => {
    const options = { };
    const result = NormalizeTableSelectFormControlOptions(options as any);

    expect(NormalizeFormControlOptions).toHaveBeenCalledWith(options);
    expect(NormalizeTableSelectFormControl).toHaveBeenCalledWith(options);
    expect(BuildNestControllerName).toHaveBeenCalled();
    expect(result.formName).toBe('testForm');
    expect(result.controllerName).toBe('NestController');
  });
});
