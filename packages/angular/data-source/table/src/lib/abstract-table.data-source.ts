import { RXAP_DATA_SOURCE_METADATA } from '@rxap/data-source';
import { Observable } from 'rxjs';
import {
  Constructor,
  hasIndexSignature,
} from '@rxap/utilities';
import {
  Inject,
  Injectable,
  isDevMode,
  Optional,
} from '@angular/core';
import {
  RXAP_TABLE_DATA_SOURCE_FILTER,
  RXAP_TABLE_DATA_SOURCE_PAGINATOR,
  RXAP_TABLE_DATA_SOURCE_PARAMETERS,
  RXAP_TABLE_DATA_SOURCE_SORT,
} from './tokens';
import {
  AbstractPaginationDataSource,
  AbstractPaginationDataSourceMetadata,
  PaginatorLike,
  RxapAbstractPaginationDataSource,
} from '@rxap/data-source/pagination';
import { ToggleSubject } from '@rxap/rxjs';

export type SortDirection = 'asc' | 'desc' | '';

export interface Sort {
  /** The id of the column being sorted. */
  active: string;
  /** The sort direction. */
  direction: SortDirection;
}

export interface SortLike {
  disabled?: boolean;
  sortChange?: Observable<Sort>;
  /** The id of the most recently sorted MatSortable. */
  active: string;
  /**
   * The direction to set when an MatSortable is initially sorted.
   * May be overriden by the MatSortable's sort start.
   */
  start: SortDirection;
  /** The sort direction of the currently active MatSortable. */
  direction: SortDirection;
}

export interface FilterLike {
  change: Observable<Record<string, any> | string>;
  current: Record<string, any> | string;
}

export type AbstractTableDataSourceMetadata = AbstractPaginationDataSourceMetadata

@Injectable()
export abstract class AbstractTableDataSource<Data extends Record<string, any> = any, Parameters = any>
  extends AbstractPaginationDataSource<Data> {

  public override readonly loading$ = new ToggleSubject(true);
  public sort?: SortLike;
  public filter?: FilterLike;
  public parameters?: Observable<Parameters>;

  constructor(
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PAGINATOR)
      paginator: PaginatorLike | null = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_SORT)
      sort: SortLike | null = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_FILTER)
      filter: FilterLike | null = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PARAMETERS)
      parameters: Observable<Parameters> | null = null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: AbstractTableDataSourceMetadata | null = null,
  ) {
    super(paginator, metadata);
    if (parameters) {
      this.parameters = parameters;
    }
    if (sort) {
      this.sort = sort;
    }
    if (filter) {
      this.filter = filter;
    }
  }

  public get sortByColumn(): string | undefined {
    return this.sort?.active;
  }

  public get sortDirection(): 'asc' | 'desc' | '' | undefined {
    return this.sort?.direction;
  }

  public get totalRowCount(): number {
    return this.paginator!.length;
  }

  public get filterValue(): Record<string, any> | string | undefined {
    return this.filter?.current;
  }

  public applySortBy(
    data: ReadonlyArray<Data>,
    column: string,
    direction: SortDirection,
  ): Data[] {
    return column ? data.slice().sort((a, b) => {

      if (!hasIndexSignature(a) || !hasIndexSignature(b)) {
        return 0;
      }

      const aColumn = a[column];
      const bColumn = b[column];

      const type = typeof aColumn;
      let sort = 0;

      switch (type) {
        case 'boolean':
          sort = aColumn === bColumn ? 0 : aColumn ? 1 : -1;
          break;
        case 'string':
          sort = aColumn.localeCompare(bColumn);
          break;
        case 'number':
        case 'bigint':
          sort = aColumn - bColumn;
          break;

      }

      return direction === 'desc' ? sort * -1 : sort;

    }) : data.slice();
  }

  public applyFilterBy(data: ReadonlyArray<Data>, filter: Record<string, any> | string): Data[] {
    if (filter) {
      if (typeof filter === 'string') {
        if (isDevMode()) {
          console.error('The filter is a string. Currently not supported by the AbstractTableDataSource');
        }
        return data.slice();
      } else {
        return data.filter(row => {
          return Object.entries(filter).every(([key, value]) => {
            const type = typeof value;
            if (row[key] !== undefined && hasIndexSignature(row)) {
              switch (type) {
                case 'undefined':
                  return true;
                case 'object':
                  return value === null || value === undefined || value === row[key];
                case 'boolean':
                  return value === row[key];
                case 'number':
                  return value === row[key];
                case 'string':
                  return (row[key] || '').toString().toLowerCase().includes(value.toLowerCase());
                case 'function':
                  return value(row[key]);
                case 'bigint':
                  return value === row[key];
              }
            }
            return true;
          });
        });
      }
    } else {
      return data.slice();
    }
  }

}

export function RxapAbstractTableDataSource(
  metadataOrId: string | AbstractTableDataSourceMetadata,
  className = 'AbstractTableDataSource',
  packageName = '@rxap/data-source/table',
) {
  return function (target: Constructor<AbstractTableDataSource<any>>) {
    RxapAbstractPaginationDataSource(metadataOrId, className, packageName)(target);
  };
}
