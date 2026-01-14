import { NormalizeTableOptions, TableModifiers } from './table-options';

jest.mock('./minimum-table-options', () => ({
  NormalizeMinimumTableOptions: jest.fn((o) => ({ ...o, actionList: [] })),
}));
jest.mock('./existing-method', () => ({ NormalizeExistingMethod: jest.fn((m) => m) }));
jest.mock('./table-open-api-options', () => ({ NormalizeTableOpenApiOptions: jest.fn((o) => o) }));
jest.mock('@rxap/utilities', () => ({
  CoerceArrayItems: jest.fn((l, i) => l.push(...i)),
}));

describe('NormalizeTableOptions', () => {
  it('should normalize table options', () => {
    const options = { columnList: [], propertyList: [] };
    const result = NormalizeTableOptions(options as any, 'test');
    expect(result.selectColumn).toBe(false);
  });

  it('should add removed_at if SHOW_ARCHIVED_SLIDE is present', () => {
    const options = { modifiers: [TableModifiers.SHOW_ARCHIVED_SLIDE], columnList: [], propertyList: [] };
    NormalizeTableOptions(options as any, 'test');
    // CoerceArrayItems was called
    const { CoerceArrayItems } = require('@rxap/utilities');
    expect(CoerceArrayItems).toHaveBeenCalled();
  });
});
