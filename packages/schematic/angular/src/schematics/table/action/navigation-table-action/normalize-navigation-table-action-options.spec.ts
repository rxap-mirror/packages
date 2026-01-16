import { TableActionKind } from '@rxap/schematic-angular';
import { NormalizeNavigationTableActionOptions } from './normalize-navigation-table-action-options';
import { NavigationTableActionOptions } from './schema';

describe('NormalizeNavigationTableActionOptions', () => {
  it('should normalize minimal navigation table action options', () => {
    const options: NavigationTableActionOptions = {
      name: 'details',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: TableActionKind.NAVIGATION,
      type: 'edit',
      route: 'details',
    };
    expect(NormalizeNavigationTableActionOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex navigation table action options', () => {
    const options: NavigationTableActionOptions = {
      name: 'edit-redirect',
      project: 'ui-lib',
      tableName: 'user-table',
      kind: TableActionKind.NAVIGATION,
      icon: 'edit',
      type: 'edit',
      route: 'details',
    };
    expect(NormalizeNavigationTableActionOptions(options)).toMatchSnapshot();
  });
});
