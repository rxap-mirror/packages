import { TableColumnModifier, IsTableColumnModifier } from './table-column-modifier';

describe('TableColumnModifier', () => {
  it('should have the expected values', () => {
    expect(TableColumnModifier.FILTER).toBe('filter');
    expect(TableColumnModifier.ACTIVE).toBe('active');
  });

  describe('Type Guards', () => {
    it('IsTableColumnModifier', () => {
      expect(IsTableColumnModifier(TableColumnModifier.FILTER)).toBe(true);
      expect(IsTableColumnModifier('invalid')).toBe(false);
    });
  });
});
