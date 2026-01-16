import {
  AbstractControlRolls,
  FormControlKinds,
} from '@rxap/schematic-angular';
import { NormalizeSelectFormControlOptions } from './normalize-select-form-control-options';
import { SelectFormControlOptions } from './schema';

describe('NormalizeSelectFormControlOptions', () => {
  it('should normalize minimal select form control options', () => {
    const options: SelectFormControlOptions = {
      name: 'test-select',
      project: 'ui-lib',
      kind: FormControlKinds.SELECT,
      formName: 'test-form',
      role: AbstractControlRolls.CONTROL,
    };
    expect(NormalizeSelectFormControlOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex select form control options', () => {
    const options: SelectFormControlOptions = {
      name: 'role',
      project: 'ui-lib',
      kind: FormControlKinds.SELECT,
      formName: 'user-form',
      role: AbstractControlRolls.CONTROL,
      label: 'User Role',
      optionList: [
        { value: 'admin', display: 'Admin' },
        { value: 'user', display: 'User' },
      ],
      multiple: true,
      validatorList: [ 'required' ],
    };
    expect(NormalizeSelectFormControlOptions(options)).toMatchSnapshot();
  });
});
