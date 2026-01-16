import { FormControlKinds } from '@rxap/schematic-angular';
import { NormalizeFormComponentOptions } from './normalize-form-component-options';
import { FormComponentOptions } from './schema';

describe('NormalizeFormComponentOptions', () => {
  it('should normalize minimal form component options', () => {
    const options: FormComponentOptions = {
      name: 'test-form',
      project: 'ui-lib',
      controlList: [],
    };

    expect(NormalizeFormComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex form component options', () => {
    const options: FormComponentOptions = {
      name: 'test-form',
      project: 'ui-lib',
      controlList: [
        {
          name: 'email',
          kind: FormControlKinds.INPUT,
          label: 'Email',
          isRequired: true,
        },
        {
          name: 'role',
          kind: FormControlKinds.SELECT,
          label: 'Role',
        },
      ],
      window: true,
      feature: 'user',
    };

    expect(NormalizeFormComponentOptions(options)).toMatchSnapshot();
  });
});
