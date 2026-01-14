import {
  NormalizeAngularOptions,
  NormalizeFormGroup,
} from '@rxap/schematic-angular';
import { dasherize } from '@rxap/utilities';
import { NormalizeFormGroupOptions } from './normalize-form-group-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeFormGroup: jest.fn((o) => ({ ...o, kind: 'group' })),
}));

jest.mock('@rxap/utilities', () => ({
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeFormGroupOptions', () => {
  it('should normalize form group options', () => {
    const options = { formName: 'myForm', context: 'myContext' };
    const result = NormalizeFormGroupOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeFormGroup).toHaveBeenCalledWith(options);
    expect(dasherize).toHaveBeenCalledWith('myForm');
    expect(dasherize).toHaveBeenCalledWith('myContext');
    expect(result.formName).toBe('myForm');
    expect(result.controllerName).toBe('myForm');
    expect(result.context).toBe('myContext');
  });
});
