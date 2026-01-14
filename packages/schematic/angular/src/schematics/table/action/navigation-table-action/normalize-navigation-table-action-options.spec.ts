import {
  NormalizeAngularOptions,
  NormalizeNavigationTableAction,
} from '@rxap/schematic-angular';
import { NormalizeNavigationTableActionOptions } from './normalize-navigation-table-action-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeNavigationTableAction: jest.fn((o) => ({ ...o, kind: 'navigation' })),
}));

describe('NormalizeNavigationTableActionOptions', () => {
  it('should normalize navigation table action options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeNavigationTableActionOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeNavigationTableAction).toHaveBeenCalledWith(options);
    expect(result.tableName).toBe('myTable');
    expect(result.kind).toBe('navigation');
  });
});
