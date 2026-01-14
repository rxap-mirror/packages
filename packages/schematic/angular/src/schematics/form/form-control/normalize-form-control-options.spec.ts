import {
  NormalizeAngularOptions,
  NormalizeFormControl,
} from '@rxap/schematic-angular';
import { dasherize } from '@rxap/schematics-utilities';
import { NormalizeFormControlOptions } from './normalize-form-control-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeFormControl: jest.fn((o) => ({ ...o, kind: 'input' })),
}));

jest.mock('@rxap/schematics-utilities', () => ({
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeFormControlOptions', () => {
  it('should normalize form control options', () => {
    const options = { formName: 'myForm', context: 'myContext' };
    const result = NormalizeFormControlOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeFormControl).toHaveBeenCalledWith(options);
    expect(dasherize).toHaveBeenCalledWith('myForm');
    expect(dasherize).toHaveBeenCalledWith('myContext');
    expect(result.formName).toBe('myForm');
    expect(result.controllerName).toBe('myForm');
    expect(result.context).toBe('myContext');
  });
});
