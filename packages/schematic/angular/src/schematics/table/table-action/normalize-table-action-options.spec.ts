import {
  NormalizeAngularOptions,
  NormalizeTableAction,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { NormalizeTableActionOptions } from './normalize-table-action-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeTableAction: jest.fn((o) => ({ ...o, kind: 'default' })),
}));

jest.mock('@rxap/schematics-utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeTableActionOptions', () => {
  it('should normalize table action options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeTableActionOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeTableAction).toHaveBeenCalledWith(options);
    expect(dasherize).toHaveBeenCalledWith('myTable');
    expect(CoerceSuffix).toHaveBeenCalledWith('myTable', '-table');
    expect(result.tableName).toBe('myTable-table');
    expect(result.kind).toBe('default');
  });
});
