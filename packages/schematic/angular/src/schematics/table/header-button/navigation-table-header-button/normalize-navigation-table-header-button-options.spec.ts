import {
  NormalizeAngularOptions,
  NormalizeNavigationHeaderButton,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { NormalizeNavigationTableHeaderButtonOptions } from './normalize-navigation-table-header-button-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeNavigationHeaderButton: jest.fn((o) => ({ ...o, kind: 'navigation' })),
}));

jest.mock('@rxap/schematics-utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeNavigationTableHeaderButtonOptions', () => {
  it('should normalize navigation table header button options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeNavigationTableHeaderButtonOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeNavigationHeaderButton).toHaveBeenCalledWith(options, 'myTable');
    expect(result.tableName).toBe('myTable-table');
    expect(result.kind).toBe('navigation');
  });
});
