import {
  AbstractControlRolls,
  FormControlKinds,
} from '@rxap/schematic-angular';
import { NormalizeFormControlOptions } from './normalize-form-control-options';
import { FormControlOptions } from './schema';

describe('NormalizeFormControlOptions', () => {
  it('should normalize minimal form control options', () => {
    const options: FormControlOptions = {
      name: 'test-control',
      project: 'ui-lib',
      kind: FormControlKinds.INPUT,
      formName: 'test-form',
      role: AbstractControlRolls.CONTROL,
    };
    expect(NormalizeFormControlOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex form control options', () => {
    const options: FormControlOptions = {
      name: 'email',
      project: 'ui-lib',
      kind: FormControlKinds.INPUT,
      formName: 'user-form',
      role: AbstractControlRolls.CONTROL,
      context: 'user-context',
      controllerName: 'CustomController',
      inputType: 'email',
    };
    expect(NormalizeFormControlOptions(options)).toMatchSnapshot();
  });
});
