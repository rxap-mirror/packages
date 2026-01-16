import { normalizeDialogComponentOptions } from './normalize-dialog-component-options';
import { DialogComponentOptions } from './schema';

describe('normalizeDialogComponentOptions', () => {
  it('should normalize minimal dialog component options', () => {
    const options: DialogComponentOptions = {
      dialogName: 'test',
      name: 'test-dialog',
      project: 'ui-lib',
    };
    expect(normalizeDialogComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex dialog component options', () => {
    const options: DialogComponentOptions = {
      dialogName: 'user',
      name: 'user-dialog',
      project: 'ui-lib',
      title: 'User Dialog',
      actionList: [
        {
          role: 'save',
        },
      ],
    };
    expect(normalizeDialogComponentOptions(options)).toMatchSnapshot();
  });
});
