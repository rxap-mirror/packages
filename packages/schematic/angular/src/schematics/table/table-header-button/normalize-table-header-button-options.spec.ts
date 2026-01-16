import { HeaderButtonKind } from '@rxap/schematic-angular';
import { NormalizeTableHeaderButtonOptions } from './normalize-table-header-button-options';
import { TableHeaderButtonOptions } from './schema';

describe('NormalizeTableHeaderButtonOptions', () => {
  it('should normalize minimal table header button options', () => {
    const options: TableHeaderButtonOptions = {
      name: 'add-user',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: HeaderButtonKind.DEFAULT,
    };
    expect(NormalizeTableHeaderButtonOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex table header button options', () => {
    const options: TableHeaderButtonOptions = {
      name: 'export-csv',
      project: 'ui-lib',
      tableName: 'data-table',
      icon: 'download',
      label: 'Export CSV',
      kind: HeaderButtonKind.DEFAULT,
    };
    expect(NormalizeTableHeaderButtonOptions(options)).toMatchSnapshot();
  });
});
