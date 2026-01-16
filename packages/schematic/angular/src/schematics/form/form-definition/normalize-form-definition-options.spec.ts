import { NormalizeFormDefinitionOptions } from './normalize-form-definition-options';
import { FormDefinitionOptions } from './schema';

describe('NormalizeFormDefinitionOptions', () => {
  it('should normalize minimal form definition options', () => {
    const options: FormDefinitionOptions = {
      name: 'test-def',
      project: 'ui-lib',
      controlList: [],
    };
    expect(NormalizeFormDefinitionOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex form definition options', () => {
    const options: FormDefinitionOptions = {
      name: 'profile-def',
      project: 'ui-lib',
      controlList: [],
      standalone: false,
    };
    expect(NormalizeFormDefinitionOptions(options)).toMatchSnapshot();
  });
});
