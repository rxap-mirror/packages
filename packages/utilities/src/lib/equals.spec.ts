import { equals } from './equals';

describe('@rxap/utilities', () => {
  describe('equals', () => {
    it('should detect quality', () => {
      expect(equals(true, true)).toBe(true);
      expect(equals(false, false)).toBe(true);
      expect(equals(false, true)).toBe(false);
      expect(equals(0, 0)).toBe(true);
      expect(equals(0, 1)).toBe(false);
      expect(equals({}, {})).toBe(true);
      expect(equals({key: 'value'}, {key: 'test'})).toBe(false);
      expect(equals({key: 'value'}, {key: 'value'})).toBe(true);
      expect(equals([], [])).toBe(true);
      expect(equals([{}], [{}])).toBe(true);
      expect(equals([{key: 'value'}], [{key: 'value'}])).toBe(true);
      expect(equals([{key: 'value'}], [{key: 'test'}])).toBe(false);
    });
  });
});
