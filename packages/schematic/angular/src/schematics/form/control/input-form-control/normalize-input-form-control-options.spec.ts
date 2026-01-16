import {
  AbstractControlRolls,
  FormControlKinds,
} from '@rxap/schematic-angular';
import { NormalizeInputFormControlOptions } from './normalize-input-form-control-options';
import { InputFormControlOptions } from './schema';

describe('NormalizeInputFormControlOptions', () => {
  it('should normalize minimal input form control options', () => {
    const options: InputFormControlOptions = {
      name: 'test-input',
      project: 'ui-lib',
      kind: FormControlKinds.INPUT,
      formName: 'test-form',
      role: AbstractControlRolls.CONTROL,
    };
    expect(NormalizeInputFormControlOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex input form control options', () => {
    const options: InputFormControlOptions = {
      name: 'email',
      project: 'ui-lib',
      kind: FormControlKinds.INPUT,
      formName: 'user-form',
      role: AbstractControlRolls.CONTROL,
      inputType: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      validatorList: [ 'required', 'email' ],
    };
    expect(NormalizeInputFormControlOptions(options)).toMatchSnapshot();
  });
});
