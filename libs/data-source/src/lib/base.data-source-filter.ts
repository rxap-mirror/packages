import { Injectable } from '@angular/core';
import { Filter } from './collection-data-source';

@Injectable({ providedIn: 'root' })
export class BaseDataSourceFilter<Data> {

  public apply(collection: Data[], filters: Array<Filter> | null): Data[] {
    return collection;
  }

}
