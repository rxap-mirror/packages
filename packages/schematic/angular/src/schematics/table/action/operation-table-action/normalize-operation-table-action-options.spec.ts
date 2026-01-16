import { TableActionKind } from '@rxap/schematic-angular';
import { NormalizeOperationTableActionOptions } from './normalize-operation-table-action-options';
import { OperationTableActionOptions } from './schema';

describe('NormalizeOperationTableActionOptions', () => {
  it('should normalize minimal operation table action options', () => {
    const options: OperationTableActionOptions = {
      name: 'delete',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: TableActionKind.OPERATION,
      type: 'delete',
    };
    expect(NormalizeOperationTableActionOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex operation table action options', () => {
    const options: OperationTableActionOptions = {
      name: 'archive',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: TableActionKind.OPERATION,
      icon: 'archive',
      type: 'archive',
    };
    expect(NormalizeOperationTableActionOptions(options)).toMatchSnapshot();
  });
});
