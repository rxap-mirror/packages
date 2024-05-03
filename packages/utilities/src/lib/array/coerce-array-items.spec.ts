import {
  COERCE_ARRAY_ITEMS_DEFAULT_OPTIONS,
  CoerceArrayItems_handleCompareFnCase,
  CoerceArrayItemsOptions,
} from '@rxap/utilities';

describe('CoerceArrayItems', () => {

  interface Item {
    id: string;
  }

  describe('handleCompareFnCase', () => {

    it('should throw an error if options.compareFn is not provided', () => {
      // Arrange
      const options: Required<CoerceArrayItemsOptions> = { ...COERCE_ARRAY_ITEMS_DEFAULT_OPTIONS, compareFn: null };
      const array: Item[] = [];
      const item: Item = { id: 'item' };

      // Act
      // Assert
      expect(() => CoerceArrayItems_handleCompareFnCase(options, array, item)).toThrowError('options.compareFn must be provided when comparing items');
    });

    it('should insert the item at the correct position in the array', () => {
      // Arrange
      const options: Required<CoerceArrayItemsOptions> = { ...COERCE_ARRAY_ITEMS_DEFAULT_OPTIONS, compareFn: (a, b) => a.id.localeCompare(b.id) };
      const array: Item[] = [ { id: 'a' }, { id: 'c' } ];
      const item: Item = { id: 'b' };

      // Act
      CoerceArrayItems_handleCompareFnCase(options, array, item);

      // Assert
      expect(array).toEqual([ { id: 'a' }, { id: 'b' }, { id: 'c' } ]);
    });

    it('should insert the item at the correct position in the array (unshift)', () => {
      // Arrange
      const options: Required<CoerceArrayItemsOptions> = { ...COERCE_ARRAY_ITEMS_DEFAULT_OPTIONS, compareFn: (a, b) => a.id.localeCompare(b.id), unshift: true };
      const array: Item[] = [ { id: 'a' }, { id: 'c' } ];
      const item: Item = { id: 'b' };

      // Act
      CoerceArrayItems_handleCompareFnCase(options, array, item);

      // Assert
      expect(array).toEqual([ { id: 'a' }, { id: 'b' }, { id: 'c' } ]);
    });

    it('should insert item into an empty array', () => {
      // Arrange
      const options: Required<CoerceArrayItemsOptions> = { ...COERCE_ARRAY_ITEMS_DEFAULT_OPTIONS, compareFn: (a, b) => a.id.localeCompare(b.id) };
      const array: Item[] = [];
      const item: Item = { id: 'a' };

      // Act
      CoerceArrayItems_handleCompareFnCase(options, array, item);

      // Assert
      expect(array).toEqual([ { id: 'a' } ]);
    });

  });

});
