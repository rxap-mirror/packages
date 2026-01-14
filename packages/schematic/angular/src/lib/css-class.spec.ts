import { CoerceCssClass, NormalizeCssClass } from './css-class';

describe('CssClass Utilities', () => {
  describe('CoerceCssClass', () => {
    it('should handle undefined/null by returning an empty array', () => {
      expect(CoerceCssClass(undefined, 'extra')).toEqual([{ name: 'extra' }]);
      expect(CoerceCssClass(null, 'extra')).toEqual([{ name: 'extra' }]);
    });

    it('should convert string to array of options', () => {
      const result = CoerceCssClass('class1 class2', 'class3');
      expect(result).toEqual([
        { name: 'class1' },
        { name: 'class2' },
        { name: 'class3' },
      ]);
    });

    it('should handle single object', () => {
      const result = CoerceCssClass({ name: 'class1' }, 'class2');
      expect(result).toEqual([
        { name: 'class1' },
        { name: 'class2' },
      ]);
    });

    it('should handle array of mixed types', () => {
      const result = CoerceCssClass(['class1', { name: 'class2' }], 'class3');
      expect(result).toEqual([
        { name: 'class1' },
        { name: 'class2' },
        { name: 'class3' },
      ]);
    });

    it('should use custom compareTo function', () => {
      const compareTo = jest.fn((a, b) => a.name === b.name);
      CoerceCssClass([{ name: 'class1' }], { name: 'class1' }, compareTo);
      expect(compareTo).toHaveBeenCalled();
    });
  });

  describe('NormalizeCssClass', () => {
    it('should return null for empty input', () => {
      expect(NormalizeCssClass(undefined)).toBeNull();
      expect(NormalizeCssClass(null)).toBeNull();
      expect(NormalizeCssClass([])).toBeNull();
    });

    it('should normalize string input', () => {
      const result = NormalizeCssClass('class1 class2');
      expect(result).toEqual([
        { name: 'class1' },
        { name: 'class2' },
      ]);
      expect(Object.isFrozen(result![0])).toBe(true);
    });

    it('should normalize array input', () => {
      const result = NormalizeCssClass(['class1', { name: 'class2' }]);
      expect(result).toEqual([
        { name: 'class1' },
        { name: 'class2' },
      ]);
    });

    it('should normalize object input', () => {
      const result = NormalizeCssClass({ name: 'class1' });
      expect(result).toEqual([{ name: 'class1' }]);
    });
  });
});
