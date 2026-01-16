import {
  AbstractControlRolls,
  FormArrayKind,
} from '@rxap/schematic-angular';
import { NormalizeFormArrayOptions } from './normalize-form-array-options';
import { FormArrayOptions } from './schema';

describe('NormalizeFormArrayOptions', () => {
  it('should normalize minimal form array options', () => {
    const options: FormArrayOptions = {
      name: 'test-array',
      project: 'ui-lib',
      formName: 'test-form',
      role: AbstractControlRolls.ARRAY,
      kind: FormArrayKind.DEFAULT,
      controlList: [],
    };
    expect(NormalizeFormArrayOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex form array options', () => {
    const options: FormArrayOptions = {
      name: 'tags',
      project: 'ui-lib',
      formName: 'post-form',
      role: AbstractControlRolls.ARRAY,
      kind: FormArrayKind.DEFAULT,
      legend: 'Tags',
      controlList: [],
    };
    expect(NormalizeFormArrayOptions(options)).toMatchSnapshot();
  });
});
