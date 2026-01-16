import {
  HeaderButtonKind,
  MethodKinds,
} from '@rxap/schematic-angular';
import { NormalizeMethodTableHeaderButtonOptions } from './normalize-method-table-header-button-options';
import { MethodTableHeaderButtonOptions } from './schema';

describe('NormalizeMethodTableHeaderButtonOptions', () => {
  it('should normalize minimal method table header button options', () => {
    const options: MethodTableHeaderButtonOptions = {
      name: 'refresh',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: HeaderButtonKind.METHOD,
      method: {
        kind: MethodKinds.IMPORT,
        import: {
          name: 'Test',
          moduleSpecifier: '@rxap/test'
        }
      },
    };
    expect(NormalizeMethodTableHeaderButtonOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex method table header button options', () => {
    const options: MethodTableHeaderButtonOptions = {
      name: 'sync',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: HeaderButtonKind.METHOD,
      icon: 'sync',
      label: 'Sync',
      method: {
        kind: MethodKinds.IMPORT,
        import: {
          name: 'Test',
          moduleSpecifier: '@rxap/test'
        }
      },
    };
    expect(NormalizeMethodTableHeaderButtonOptions(options)).toMatchSnapshot();
  });
});
