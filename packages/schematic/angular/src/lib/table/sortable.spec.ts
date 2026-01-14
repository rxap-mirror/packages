import { NormalizeSortable } from './sortable';

describe('NormalizeSortable', () => {
  it('should return default if undefined', () => {
    expect(NormalizeSortable()).toEqual({ enabled: false, default: null });
  });

  it('should handle boolean input', () => {
    expect(NormalizeSortable(true)).toEqual({ enabled: true, default: null });
    expect(NormalizeSortable(false)).toEqual({ enabled: false, default: null });
  });

  it('should normalize sortable object', () => {
    const input = { enabled: true, default: { active: 'id', direction: 'asc' as const } };
    expect(NormalizeSortable(input)).toEqual(input);
  });

  it('should handle missing default properties', () => {
    const input = { enabled: true, default: {} };
    expect(NormalizeSortable(input)).toEqual({
      enabled: true,
      default: { active: null, direction: null }
    });
  });
});
