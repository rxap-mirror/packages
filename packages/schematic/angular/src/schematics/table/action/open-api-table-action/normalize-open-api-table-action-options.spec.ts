import {
  NormalizeAngularOptions,
  NormalizeOpenApiTableAction,
} from '@rxap/schematic-angular';
import { NormalizeOpenApiTableActionOptions } from './normalize-open-api-table-action-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeOpenApiTableAction: jest.fn((o) => ({ ...o, kind: 'open-api' })),
}));

describe('NormalizeOpenApiTableActionOptions', () => {
  it('should normalize open-api table action options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeOpenApiTableActionOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeOpenApiTableAction).toHaveBeenCalledWith(options);
    expect(result.tableName).toBe('myTable');
    expect(result.kind).toBe('open-api');
  });
});
