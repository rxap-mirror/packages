import { Injectable } from '@angular/core';
import { Filter } from './collection-data-source';

@Injectable({ providedIn: 'root' })
export class BaseDataSourceFilter<Source extends any[]> {

  public apply(collection: Source, filters: Array<Filter> | null): Source {
    return collection;
  }

}
