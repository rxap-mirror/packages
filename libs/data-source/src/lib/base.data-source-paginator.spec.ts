import { BaseDataSourcePaginator } from './base.data-source-paginator';
import { DataSourceErrorTypes } from './data-source.error';

function IndexArray(length: number, offset: number = 0): number[] {
  return Array(length).fill(null).map((_, index) => offset + index);
}

describe('Base Data Source Paginator', () => {

  let dataSourcePaginator: BaseDataSourcePaginator<any>;

  beforeEach(() => {

    dataSourcePaginator = new BaseDataSourcePaginator<any>();

  });

  it('should throw if the defined page is out of bound', () => {

    expect(() => dataSourcePaginator.apply(
      Array(50),
      10,
      10
    )).toThrow(DataSourceErrorTypes.PAGE_IS_OUT_OF_BOUND);

    expect(() => dataSourcePaginator.apply(
      Array(50),
      2,
      20
    )).not.toThrow(DataSourceErrorTypes.PAGE_IS_OUT_OF_BOUND);

  });

  it('should throw if illegal page size is passed', () => {

    expect(() => dataSourcePaginator.apply(
      Array(50),
      -1,
      10
    )).toThrow(DataSourceErrorTypes.ILLIGAL_PAGE);

    expect(() => dataSourcePaginator.apply(
      Array(50),
      10,
      0
    )).toThrow(DataSourceErrorTypes.ILLIGAL_PAGE);

    expect(() => dataSourcePaginator.apply(
      Array(50),
      10,
      -1
    )).toThrow(DataSourceErrorTypes.ILLIGAL_PAGE);

  });

  it('should return the defined page of the collection', () => {

    expect(dataSourcePaginator.apply(
      IndexArray(50),
      2,
      10
    )).toEqual(IndexArray(10, 20));

    expect(dataSourcePaginator.apply(
      IndexArray(50),
      0,
      10
    )).toEqual(IndexArray(10));

    expect(dataSourcePaginator.apply(
      IndexArray(50),
      2,
      20
    )).toEqual(IndexArray(10, 40));

  });

  it('should return an empty array if the collection is null', () => {

    expect(dataSourcePaginator.apply(null, 10, 30)).toEqual([]);

  });

  it('should return an full collection if the pageSize is null', () => {

    expect(dataSourcePaginator.apply(IndexArray(50), 10, null)).toEqual(IndexArray(50));

  });

});
