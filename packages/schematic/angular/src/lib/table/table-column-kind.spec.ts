import { TableColumnKind, IsTableColumnKind } from './table-column-kind';

describe('TableColumnKind', () => {
  it('should have the expected values', () => {
    expect(TableColumnKind.DEFAULT).toBe('default');
    expect(TableColumnKind.DATE).toBe('date');
    expect(TableColumnKind.BOOLEAN).toBe('boolean');
  });

  describe('Type Guards', () => {
    it('IsTableColumnKind', () => {
      expect(IsTableColumnKind(TableColumnKind.DATE)).toBe(true);
      expect(IsTableColumnKind('invalid')).toBe(false);
    });
  });
});
