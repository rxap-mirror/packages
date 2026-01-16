import {
  BackendTypes,
  HeaderButtonKind,
} from '@rxap/schematic-angular';
import { NormalizeFormTableHeaderButtonOptions } from './normalize-form-table-header-button-options';
import { FormTableHeaderButtonOptions } from './schema';

describe('NormalizeFormTableHeaderButtonOptions', () => {
  it('should normalize minimal form table header button options', () => {
    const options: FormTableHeaderButtonOptions = {
      name: 'filter',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: HeaderButtonKind.FORM,
      form: {
        controlList: [],
      },
      backend: {
        kind: BackendTypes.NESTJS,
        module: 'jest'
      }
    };
    expect(NormalizeFormTableHeaderButtonOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex form table header button options', () => {
    const options: FormTableHeaderButtonOptions = {
      name: 'advanced-search',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: HeaderButtonKind.FORM,
      icon: 'search',
      label: 'Search',
      form: {
        controlList: [
          { name: 'query', kind: 'input' },
        ],
      },
      backend: {
        kind: BackendTypes.NESTJS,
        module: 'jest'
      }
    };
    expect(NormalizeFormTableHeaderButtonOptions(options)).toMatchSnapshot();
  });
});
