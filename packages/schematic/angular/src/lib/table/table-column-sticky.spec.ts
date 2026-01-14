import { TableColumnSticky, IsTableColumnSticky } from './table-column-sticky';

describe('TableColumnSticky', () => {
  it('should have the expected values', () => {
    expect(TableColumnSticky.START).toBe('start');
    expect(TableColumnSticky.END).toBe('end');
  });

  describe('Type Guards', () => {
    it('IsTableColumnSticky', () => {
      expect(IsTableColumnSticky(TableColumnSticky.START)).toBe(true);
      expect(IsTableColumnSticky('invalid')).toBe(false);
    });
  });
});
