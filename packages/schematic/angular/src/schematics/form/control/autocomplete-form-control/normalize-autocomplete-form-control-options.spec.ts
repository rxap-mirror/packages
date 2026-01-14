import { NormalizeAutocompleteFormControl } from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import { NormalizeFormControlOptions } from '../../form-control/normalize-form-control-options';
import { NormalizeAutocompleteFormControlOptions } from './normalize-autocomplete-form-control-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAutocompleteFormControl: jest.fn((o) => ({ ...o, kind: 'autocomplete' })),
}));

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

jest.mock('../../form-control/normalize-form-control-options', () => ({
  NormalizeFormControlOptions: jest.fn((o) => ({ ...o, formName: 'testForm' })),
}));

describe('NormalizeAutocompleteFormControlOptions', () => {
  it('should normalize autocomplete form control options', () => {
    const options = { };
    const result = NormalizeAutocompleteFormControlOptions(options as any);

    expect(NormalizeFormControlOptions).toHaveBeenCalledWith(options);
    expect(NormalizeAutocompleteFormControl).toHaveBeenCalledWith(options);
    expect(BuildNestControllerName).toHaveBeenCalled();
    expect(result.formName).toBe('testForm');
    expect(result.controllerName).toBe('NestController');
  });
});
