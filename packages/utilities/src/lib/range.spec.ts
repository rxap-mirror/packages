import { Range } from './range';

describe('@rxap/utilities', () => {

  describe('Range', () => {

    it('should iterator over specified range 0 - 10', () => {

      const array: number[] = [];

      for (const value of new Range(0, 10)) {
        array.push(value);
      }

      expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    });

    it('should iterator over specified range -5 - 5', () => {

      const array: number[] = [];

      for (const value of new Range(-5, 5)) {
        array.push(value);
      }

      expect(array).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);

    });

    it('should iterator over specified range 0 - 10 reverse', () => {

      const array: number[] = [];

      for (const value of new Range(0, 10).reverse()) {
        array.push(value);
      }

      expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reverse());

    });

    it('should iterator over specified range -5 - 5 reverse', () => {

      const array: number[] = [];

      for (const value of new Range(-5, 5).reverse()) {
        array.push(value);
      }

      expect(array).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].reverse());

    });

  });

});
