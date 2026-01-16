import { HeaderButtonKind } from '@rxap/schematic-angular';
import { NormalizeNavigationTableHeaderButtonOptions } from './normalize-navigation-table-header-button-options';
import { NavigationTableHeaderButtonOptions } from './schema';

describe('NormalizeNavigationTableHeaderButtonOptions', () => {
  it('should normalize minimal navigation table header button options', () => {
    const options: NavigationTableHeaderButtonOptions = {
      name: 'back',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: HeaderButtonKind.NAVIGATION,
      route: '/users',
    };
    expect(NormalizeNavigationTableHeaderButtonOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex navigation table header button options', () => {
    const options: NavigationTableHeaderButtonOptions = {
      name: 'create',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: HeaderButtonKind.NAVIGATION,
      icon: 'add',
      label: 'Create',
      route: '/users',
    };
    expect(NormalizeNavigationTableHeaderButtonOptions(options)).toMatchSnapshot();
  });
});
