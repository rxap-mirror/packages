import { TableActionKind } from '@rxap/schematic-angular';
import { NormalizeDialogTableActionOptions } from './normalize-dialog-table-action-options';
import { DialogTableActionOptions } from './schema';

describe('NormalizeDialogTableActionOptions', () => {
  it('should normalize minimal dialog table action options', () => {
    const options: DialogTableActionOptions = {
      name: 'edit',
      project: 'ui-lib',
      tableName: 'user-table',
      title: 'View User',
      kind: TableActionKind.DIALOG,
      type: 'edit',
    };
    expect(NormalizeDialogTableActionOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex dialog table action options', () => {
    const options: DialogTableActionOptions = {
      name: 'view',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: TableActionKind.DIALOG,
      icon: 'visibility',
      title: 'View User',
      type: 'view',
    };
    expect(NormalizeDialogTableActionOptions(options)).toMatchSnapshot();
  });
});
