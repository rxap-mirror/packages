import {
  Observable,
  combineLatest,
  of,
  EMPTY
} from 'rxjs';
import {
  switchMap,
  startWith
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  BaseDataSource,
  IBaseDataSourceViewer
} from './base.data-source';

export enum SortDirectionTypes {
  ASC  = 'asc',
  DESC = 'desc',
}

export type SortDirection = SortDirectionTypes | null;

export interface Sort {
  key: string;
  direction: SortDirection;
}

export enum FilterCompareTypes {
  GREATER          = '>',
  GREATER_OR_EQUAL = '>=',
  LESS             = '<',
  LESS_OR_EQUAL    = '<=',
  EQUAL            = '==',
  NOT_EQUAL        = '!=',
  REGEX            = 'regex',
  INCLUDES         = 'includes'
}


export interface Filter {
  key: string;
  value: string | number | boolean | null;
  compare: FilterCompareTypes;
}

export interface ICollectionDataSourceViewer extends IBaseDataSourceViewer {
  page$?: Observable<number>;
  pageSize$?: Observable<number>;
  sort$?: Observable<Sort>;
  filters$?: Observable<Array<Filter>>;
}

export type DataSourceId = string;

@Injectable()
export class CollectionDataSource<Data, Source = Data[], Viewer extends ICollectionDataSourceViewer = ICollectionDataSourceViewer>
  extends BaseDataSource<ReadonlyArray<Data>, Source, Viewer> {

  public apply(
    collection: Source,
    page: number | null,
    pageSize: number | null,
    sort: Sort | null,
    filters: Filter[] | null
  ): Observable<Source> {
    return of(collection);
  }

  public _connect(viewer: Viewer): Observable<Source> {

    return combineLatest([
      this.source$,
      (viewer.page$ || EMPTY).pipe(startWith(null)),
      (viewer.pageSize$ || EMPTY).pipe(startWith(null)),
      (viewer.sort$ || EMPTY).pipe(startWith(null)),
      (viewer.filters$ || EMPTY).pipe(startWith(null))
    ]).pipe(
      switchMap(([ collection, page, pageSize, sort, filters ]: [ Source, number | null, number | null, Sort | null, Filter[] | null ]) =>
        this.apply(collection, page, pageSize, sort, filters)
      )
    );

  }

}
