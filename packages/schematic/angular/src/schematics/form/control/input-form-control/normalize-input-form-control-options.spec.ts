import { NormalizeInputFormControl } from '@rxap/schematic-angular';
import { NormalizeFormControlOptions } from '../../form-control/normalize-form-control-options';
import { NormalizeInputFormControlOptions } from './normalize-input-form-control-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeInputFormControl: jest.fn((o) => ({ ...o, kind: 'input' })),
}));

jest.mock('../../form-control/normalize-form-control-options', () => ({
  NormalizeFormControlOptions: jest.fn((o) => ({ ...o, formName: 'testForm' })),
}));

describe('NormalizeInputFormControlOptions', () => {
  it('should normalize input form control options', () => {
    const options = { };
    const result = NormalizeInputFormControlOptions(options as any);

    expect(NormalizeFormControlOptions).toHaveBeenCalledWith(options);
    expect(NormalizeInputFormControl).toHaveBeenCalledWith(options);
    expect(result.formName).toBe('testForm');
    expect(result.kind).toBe('input');
  });
});
