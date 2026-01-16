import { BackendTypes, TableColumnKind, TableModifiers, } from '@rxap/schematic-angular';
import { NormalizeTableComponentOptions } from './normalize-table-component-options';
import { TableComponentOptions } from './schema';

describe('NormalizeTableComponentOptions', () => {
  it('should normalize minimal table component options', () => {
    const options: TableComponentOptions = {
      name: 'test-table',
      project: 'ui-lib',
      columnList: [],
      actionList: [],
      filterList: [],
      propertyList: [],
    };

    expect(NormalizeTableComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex table component options', () => {
    const options: TableComponentOptions = {
      name: 'test-table',
      project: 'ui-lib',
      columnList: [
        {
          name: 'name',
          kind: TableColumnKind.DEFAULT,
        },
        {
          name: 'created',
          kind: TableColumnKind.DATE,
        },
      ],
      actionList: [],
      filterList: [],
      propertyList: [],
      backend: {
        kind: BackendTypes.NESTJS,
        project: 'api',
        module: 'api-module',
      },
      sortable: true,
      selectColumn: true,
      modifiers: [ TableModifiers.WITHOUT_TITLE ],
    };

    expect(NormalizeTableComponentOptions(options)).toMatchSnapshot();
  });
});
