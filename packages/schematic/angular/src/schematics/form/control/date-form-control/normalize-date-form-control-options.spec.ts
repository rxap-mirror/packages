import { NormalizeDateFormControl } from '@rxap/schematic-angular';
import { NormalizeFormControlOptions } from '../../form-control/normalize-form-control-options';
import { NormalizeDateFormControlOptions } from './normalize-date-form-control-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeDateFormControl: jest.fn((o) => ({ ...o, kind: 'date' })),
}));

jest.mock('../../form-control/normalize-form-control-options', () => ({
  NormalizeFormControlOptions: jest.fn((o) => ({ ...o, formName: 'testForm' })),
}));

describe('NormalizeDateFormControlOptions', () => {
  it('should normalize date form control options', () => {
    const options = { };
    const result = NormalizeDateFormControlOptions(options as any);

    expect(NormalizeFormControlOptions).toHaveBeenCalledWith(options);
    expect(NormalizeDateFormControl).toHaveBeenCalledWith(options);
    expect(result.formName).toBe('testForm');
    expect(result.kind).toBe('date');
  });
});
