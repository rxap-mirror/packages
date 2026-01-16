import { BackendTypes } from '@rxap/schematic-angular';
import { UpstreamOptionsKinds } from '@rxap/ts-morph';
import { NormalizeDataGridComponentOptions } from './normalize-data-grid-component-options';
import { DataGridComponentOptions } from './schema';

describe('NormalizeDataGridComponentOptions', () => {
  it('should normalize minimal data grid component options', () => {
    const options: DataGridComponentOptions = {
      name: 'test-grid',
      project: 'ui-lib',
      itemList: [],
    };
    expect(NormalizeDataGridComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex data grid component options', () => {
    const options: DataGridComponentOptions = {
      name: 'user-grid',
      project: 'ui-lib',
      backend: {
        kind: BackendTypes.NESTJS,
      },
      upstream: {
        kind: UpstreamOptionsKinds.OPEN_API,
        operationId: 'user-controller-getAll',
      },
      itemList: [
        {
          name: 'name',
          hasCellDef: true,
          formControl: {
            kind: 'input',
            name: 'name',
          },
        },
        {
          name: 'email',
        },
      ],
    };
    expect(NormalizeDataGridComponentOptions(options)).toMatchSnapshot();
  });
});
