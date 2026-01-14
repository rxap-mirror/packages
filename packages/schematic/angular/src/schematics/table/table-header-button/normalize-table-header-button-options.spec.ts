import {
  NormalizeAngularOptions,
  NormalizeHeaderButton,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { NormalizeTableHeaderButtonOptions } from './normalize-table-header-button-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeHeaderButton: jest.fn((o) => ({ ...o, kind: 'default' })),
}));

jest.mock('@rxap/schematics-utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeTableHeaderButtonOptions', () => {
  it('should normalize table header button options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeTableHeaderButtonOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeHeaderButton).toHaveBeenCalledWith(options, 'myTable');
    expect(dasherize).toHaveBeenCalledWith('myTable');
    expect(CoerceSuffix).toHaveBeenCalledWith('myTable', '-table');
    expect(result.tableName).toBe('myTable-table');
    expect(result.kind).toBe('default');
  });

  it('should throw if NormalizeHeaderButton returns null', () => {
    const options = { tableName: 'myTable' };
    (NormalizeHeaderButton as jest.Mock).mockReturnValue(null);

    expect(() => NormalizeTableHeaderButtonOptions(options as any)).toThrow('FATAL: should never happen');
  });
});
