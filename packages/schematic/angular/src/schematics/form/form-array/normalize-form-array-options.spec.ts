import {
  NormalizeAngularOptions,
  NormalizeFormArray,
} from '@rxap/schematic-angular';
import { dasherize } from '@rxap/utilities';
import { NormalizeFormArrayOptions } from './normalize-form-array-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeFormArray: jest.fn((o) => ({ ...o, kind: 'array' })),
}));

jest.mock('@rxap/utilities', () => ({
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeFormArrayOptions', () => {
  it('should normalize form array options', () => {
    const options = { formName: 'myForm', context: 'myContext' };
    const result = NormalizeFormArrayOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeFormArray).toHaveBeenCalledWith(options);
    expect(dasherize).toHaveBeenCalledWith('myForm');
    expect(dasherize).toHaveBeenCalledWith('myContext');
    expect(result.formName).toBe('myForm');
    expect(result.controllerName).toBe('myForm');
    expect(result.context).toBe('myContext');
  });
});
