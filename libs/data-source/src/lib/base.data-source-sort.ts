import { Injectable } from '@angular/core';
import {
  SortDirectionTypes,
  Sort
} from './collection-data-source';

@Injectable({ providedIn: 'root' })
export class BaseDataSourceSort<Data> {

  public apply(collection: Data[], sort: Sort | null): Data[] {
    return sort === null || sort.key === null || sort.direction === null ? collection : collection.sort((a: any, b: any) => {
      if (a.hasOwnProperty(sort.key) && b.hasOwnProperty(sort.key)) {
        return this.sort(a[ sort.key ], b[ sort.key ], sort.direction as any);
      } else if (!a.hasOwnProperty(sort.key)) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  public sort(aValue: any, bValue: any, direction: SortDirectionTypes): number {
    let compare = 0;

    if (typeof aValue === 'string') {
      compare = aValue.localeCompare(bValue);
    }
    if (typeof aValue === 'number') {
      compare = aValue - bValue;
    }
    if (typeof aValue === 'boolean') {
      compare = Number(aValue) - Number(bValue);
    }

    return direction === SortDirectionTypes.ASC ? compare : compare === 0 ? compare : compare * -1;
  }

}
