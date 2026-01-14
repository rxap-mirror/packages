import { TableActionKind, IsTableActionKind } from './table-action-kind';

describe('TableActionKind', () => {
  it('should have the expected values', () => {
    expect(TableActionKind.DEFAULT).toBe('default');
    expect(TableActionKind.DIALOG).toBe('dialog');
    expect(TableActionKind.FORM).toBe('form');
    expect(TableActionKind.NAVIGATION).toBe('navigation');
    expect(TableActionKind.OPEN_API).toBe('open-api');
    expect(TableActionKind.OPERATION).toBe('operation');
  });

  describe('Type Guards', () => {
    it('IsTableActionKind', () => {
      expect(IsTableActionKind(TableActionKind.DIALOG)).toBe(true);
      expect(IsTableActionKind('invalid')).toBe(false);
    });
  });
});
