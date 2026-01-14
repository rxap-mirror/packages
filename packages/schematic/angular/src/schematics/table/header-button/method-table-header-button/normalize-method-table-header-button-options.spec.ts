import {
  NormalizeAngularOptions,
  NormalizeMethodHeaderButton,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/utilities';
import { NormalizeMethodTableHeaderButtonOptions } from './normalize-method-table-header-button-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeMethodHeaderButton: jest.fn((o) => ({ ...o, kind: 'method' })),
}));

jest.mock('@rxap/utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeMethodTableHeaderButtonOptions', () => {
  it('should normalize method table header button options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeMethodTableHeaderButtonOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeMethodHeaderButton).toHaveBeenCalledWith(options, 'myTable');
    expect(result.tableName).toBe('myTable-table');
    expect(result.kind).toBe('method');
  });
});
