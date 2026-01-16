import {
  AbstractControlRolls,
  FormGroupKind,
} from '@rxap/schematic-angular';
import { NormalizeFormGroupOptions } from './normalize-form-group-options';
import { FormGroupOptions } from './schema';

describe('NormalizeFormGroupOptions', () => {
  it('should normalize minimal form group options', () => {
    const options: FormGroupOptions = {
      name: 'test-group',
      project: 'ui-lib',
      formName: 'test-form',
      role: AbstractControlRolls.GROUP,
      kind: FormGroupKind.DEFAULT,
      controlList: [],
    };
    expect(NormalizeFormGroupOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex form group options', () => {
    const options: FormGroupOptions = {
      name: 'address',
      project: 'ui-lib',
      formName: 'user-form',
      role: AbstractControlRolls.GROUP,
      kind: FormGroupKind.DEFAULT,
      legend: 'Address',
      controlList: [],
    };
    expect(NormalizeFormGroupOptions(options)).toMatchSnapshot();
  });
});
