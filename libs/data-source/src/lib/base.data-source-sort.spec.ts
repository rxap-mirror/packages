import { BaseDataSourceSort } from './base.data-source-sort';
import { SortDirectionTypes } from './base-data-source';

describe('Base Data Source Sort', () => {

  let dataSourceSort: BaseDataSourceSort<any>;

  beforeEach(() => {

    dataSourceSort = new BaseDataSourceSort<any>();

  });

  describe('string', () => {

    it('ASC', () => {

      expect(dataSourceSort.sort('a', 'b', SortDirectionTypes.ASC)).toBe(-1);
      expect(dataSourceSort.sort('b', 'a', SortDirectionTypes.ASC)).toBe(1);
      expect(dataSourceSort.sort('a', 'a', SortDirectionTypes.ASC)).toBe(0);

    });

    it('DESC', () => {

      expect(dataSourceSort.sort('a', 'b', SortDirectionTypes.DESC)).toBe(1);
      expect(dataSourceSort.sort('b', 'a', SortDirectionTypes.DESC)).toBe(-1);
      expect(dataSourceSort.sort('a', 'a', SortDirectionTypes.DESC)).toBe(0);

    });

  });

  describe('boolean', () => {

    it('ASC', () => {

      expect(dataSourceSort.sort(true, false, SortDirectionTypes.ASC)).toBe(1);
      expect(dataSourceSort.sort(false, true, SortDirectionTypes.ASC)).toBe(-1);
      expect(dataSourceSort.sort(true, true, SortDirectionTypes.ASC)).toBe(0);
      expect(dataSourceSort.sort(false, false, SortDirectionTypes.ASC)).toBe(0);

    });

    it('DESC', () => {

      expect(dataSourceSort.sort(true, false, SortDirectionTypes.DESC)).toBe(-1);
      expect(dataSourceSort.sort(false, true, SortDirectionTypes.DESC)).toBe(1);
      expect(dataSourceSort.sort(true, true, SortDirectionTypes.DESC)).toBe(0);
      expect(dataSourceSort.sort(false, false, SortDirectionTypes.DESC)).toBe(0);

    });

  });

  describe('number', () => {

    it('ASC', () => {

      expect(dataSourceSort.sort(0, 0, SortDirectionTypes.ASC)).toBe(0);
      expect(dataSourceSort.sort(1, 1, SortDirectionTypes.ASC)).toBe(0);
      expect(dataSourceSort.sort(1, 0, SortDirectionTypes.ASC)).toBe(1);
      expect(dataSourceSort.sort(0, 1, SortDirectionTypes.ASC)).toBe(-1);
      expect(dataSourceSort.sort(-1, 0, SortDirectionTypes.ASC)).toBe(-1);
      expect(dataSourceSort.sort(0, -1, SortDirectionTypes.ASC)).toBe(1);

    });

    it('DESC', () => {

      expect(dataSourceSort.sort(0, 0, SortDirectionTypes.DESC)).toBe(0);
      expect(dataSourceSort.sort(1, 1, SortDirectionTypes.DESC)).toBe(0);
      expect(dataSourceSort.sort(1, 0, SortDirectionTypes.DESC)).toBe(-1);
      expect(dataSourceSort.sort(0, 1, SortDirectionTypes.DESC)).toBe(1);
      expect(dataSourceSort.sort(-1, 0, SortDirectionTypes.DESC)).toBe(1);
      expect(dataSourceSort.sort(0, -1, SortDirectionTypes.DESC)).toBe(-1);

    });

  });


});
