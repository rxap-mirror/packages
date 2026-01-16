import {
  AbstractControlRolls,
  FormControlKinds,
} from '@rxap/schematic-angular';
import { NormalizeDateFormControlOptions } from './normalize-date-form-control-options';
import { DateFormControlOptions } from './schema';

describe('NormalizeDateFormControlOptions', () => {
  it('should normalize minimal date form control options', () => {
    const options: DateFormControlOptions = {
      name: 'test-date',
      project: 'ui-lib',
      kind: FormControlKinds.DATE,
      formName: 'test-form',
      role: AbstractControlRolls.CONTROL,
    };
    expect(NormalizeDateFormControlOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex date form control options', () => {
    const options: DateFormControlOptions = {
      name: 'birthDate',
      project: 'ui-lib',
      kind: FormControlKinds.DATE,
      formName: 'user-form',
      role: AbstractControlRolls.CONTROL,
      label: 'Birth Date',
      placeholder: 'Select your birth date',
      validatorList: [ 'required' ],
    };
    expect(NormalizeDateFormControlOptions(options)).toMatchSnapshot();
  });
});
