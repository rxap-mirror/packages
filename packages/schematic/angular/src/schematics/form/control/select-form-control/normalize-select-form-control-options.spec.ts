import { NormalizeSelectFormControl } from '@rxap/schematic-angular';
import { NormalizeFormControlOptions } from '../../form-control/normalize-form-control-options';
import { NormalizeSelectFormControlOptions } from './normalize-select-form-control-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeSelectFormControl: jest.fn((o) => ({ ...o, kind: 'select' })),
}));

jest.mock('../../form-control/normalize-form-control-options', () => ({
  NormalizeFormControlOptions: jest.fn((o) => ({ ...o, formName: 'testForm' })),
}));

describe('NormalizeSelectFormControlOptions', () => {
  it('should normalize select form control options', () => {
    const options = { };
    const result = NormalizeSelectFormControlOptions(options as any);

    expect(NormalizeFormControlOptions).toHaveBeenCalledWith(options);
    expect(NormalizeSelectFormControl).toHaveBeenCalledWith(options);
    expect(result.formName).toBe('testForm');
    expect(result.kind).toBe('select');
  });
});
