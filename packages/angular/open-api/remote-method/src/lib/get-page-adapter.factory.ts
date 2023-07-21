import { BaseRemoteMethod } from '@rxap/remote-method';
import { TableEvent } from '@rxap/data-source/table';
import { coerceString } from '@rxap/utilities';
import type { OpenApiRemoteMethod } from './open-api.remote-method';
import { PaginatorLike } from '@rxap/data-source/pagination';

export interface GetPageRemoteMethodParameters {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'desc' | 'asc' | undefined | '';
  filter: string;
}

export interface GetPageResponse<Data extends Record<string, any>> extends GetPageRemoteMethodParameters {
  total: number;
  rows: Data[];
}

export interface GetPageAdapterDefaultOptions {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export class GetPageAdapterRemoteMethod<Data extends Record<string, any>>
  extends BaseRemoteMethod<Data[], TableEvent> {

  constructor(
    private readonly remoteMethod: OpenApiRemoteMethod<GetPageResponse<Data>, GetPageRemoteMethodParameters>,
    private readonly paginator?: PaginatorLike,
    private readonly options?: GetPageAdapterDefaultOptions,
  ) {
    super(null, remoteMethod.metadata);
  }

  public static BuildFilter(filterEvent?: string | Record<string, any> | null): string[] {
    const filter: string[] = [];
    if (!filterEvent || typeof filterEvent === 'string') {
      filter.push('__archived:false');
    } else {
      if (!filterEvent['__archived']) {
        filter.push([ '__archived', 'false' ].join('|'));
      }
      for (const [ key, value ] of Object.entries(filterEvent)) {
        if (value !== null && value !== undefined && `${ value }` !== '') {
          const valueString = coerceString(value);
          if (valueString) {
            filter.push([ key, valueString ].join('|'));
          }
        }
      }
    }
    return filter;
  }

  protected async _call(event: TableEvent): Promise<Data[]> {
    const sortBy = event.sort?.active ?? this.options?.sortBy ?? '__updatedAt';
    const parameters: GetPageRemoteMethodParameters = {
      pageIndex: event.page?.pageIndex ?? 0,
      pageSize: event.page?.pageSize ?? 10,
      sortBy,
      // use the || operator to set the default sort direction if the sort direction is undefined or an empty string
      sortDirection: (sortBy === '__updatedAt' ? 'desc' : event.sort?.direction) ||
        (this.options?.sortDirection ?? 'asc'),
      filter: GetPageAdapterRemoteMethod.BuildFilter(event.filter),
      ...(event.parameters ?? {}),
    };
    const response = await this.remoteMethod.call({ parameters });

    if (event.setTotalLength) {
      event.setTotalLength(response.total);
    }

    if (this.paginator) {
      this.paginator.length = response.total;
    }

    return response.rows;
  }

}

export function GetPageAdapterFactory(remoteMethod: OpenApiRemoteMethod, paginator?: PaginatorLike) {
  return new GetPageAdapterRemoteMethod(remoteMethod, paginator);
}

export function GetPageAdapterFactoryWithOptions(options: GetPageAdapterDefaultOptions = {}) {
  return (remoteMethod: OpenApiRemoteMethod, paginator?: PaginatorLike) => {
    return new GetPageAdapterRemoteMethod(remoteMethod, paginator, options);
  };
}
