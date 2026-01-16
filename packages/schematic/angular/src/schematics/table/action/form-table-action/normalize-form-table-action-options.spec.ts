import { TableActionKind } from '@rxap/schematic-angular';
import { NormalizeFormTableActionOptions } from './normalize-form-table-action-options';
import { FormTableActionOptions } from './schema';

describe('NormalizeFormTableActionOptions', () => {
  it('should normalize minimal form table action options', () => {
    const options: FormTableActionOptions = {
      name: 'filter',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: TableActionKind.FORM,
      type: 'edit',
      form: {
        controlList: [],
      },
    };
    expect(NormalizeFormTableActionOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex form table action options', () => {
    const options: FormTableActionOptions = {
      name: 'complex-filter',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: TableActionKind.FORM,
      icon: 'filter_list',
      type: 'edit',
      form: {
        controlList: [
          { name: 'status', kind: 'input' }
        ],
      },
    };
    expect(NormalizeFormTableActionOptions(options)).toMatchSnapshot();
  });
});
