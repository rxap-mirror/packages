import { Injectable } from '@angular/core';
import {
  DataSourceErrorTypes,
  DataSourceError
} from './data-source.error';

@Injectable({ providedIn: 'root' })
export class BaseDataSourcePaginator<Data> {

  public apply(collection: Data[] | null, page: number | null, pageSize: number | null): Data[] {
    if (collection === null) {
      return [];
    }
    if (pageSize === null) {
      return collection;
    }
    if (page === null) {
      page = 0;
    }
    if (pageSize < 1 || page < 0) {
      throw new DataSourceError(DataSourceErrorTypes.ILLIGAL_PAGE, { page, pageSize });
    }
    if (pageSize * page >= collection.length) {
      throw new DataSourceError(DataSourceErrorTypes.PAGE_IS_OUT_OF_BOUND, { page, pageSize, collectionLength: collection.length });
    }
    return collection.splice(page * pageSize, pageSize);
  }

}
