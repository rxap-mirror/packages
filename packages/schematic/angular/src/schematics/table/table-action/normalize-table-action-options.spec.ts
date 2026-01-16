import { NormalizeTableActionOptions } from './normalize-table-action-options';
import { TableActionOptions } from './schema';

describe('NormalizeTableActionOptions', () => {
  it('should normalize minimal table action options', () => {
    const options: TableActionOptions = {
      name: 'delete',
      project: 'ui-lib',
      tableName: 'user-table',
      type: 'edit'
    };
    expect(NormalizeTableActionOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex table action options', () => {
    const options: TableActionOptions = {
      name: 'edit',
      project: 'ui-lib',
      tableName: 'user-table',
      type: 'edit',
      icon: 'edit',
      tooltip: 'Edit User',
    };
    expect(NormalizeTableActionOptions(options)).toMatchSnapshot();
  });
});
