import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { MethodWithParameters } from '@rxap/pattern';
import { Constructor } from '@rxap/utilities';
import { ProvideMethodWithParametersMock } from './provide-method-mock';

export interface GetPageParameter {
  filter?: Array<string>;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface PageDto<T> {
  rows: Array<T>;
  pageSize: number;
  pageIndex: number;
  total: number;
  sortDirection?: string;
  sortBy?: string;
  filter?: Array<any>;
}

export function ProvideRxapNestjsGetPageMethod<T, AddinalParameters>(
  method: Constructor<MethodWithParameters<PageDto<T>, OpenApiRemoteMethodParameter<GetPageParameter & AddinalParameters>>>,
  data: T[],
) {
  return ProvideMethodWithParametersMock(method, (input: OpenApiRemoteMethodParameter<GetPageParameter>) => {
    const parameters = input?.parameters;
    if (!parameters) {
      console.warn('No parameters provided');
      return {
        rows: [],
        pageSize: 0,
        pageIndex: 0,
        total: 0,
      };
    }
    const {
      pageIndex,
      pageSize,
      sortBy,
      sortDirection,
      filter,
    } = parameters;
    let filteredData = data.slice();
    if (filter?.length) {
      filteredData =
        filteredData.filter((row: any) => filter.map(f => f.split('|'))
          .some(([ key, value ]) => row[key] === undefined || (
            row[key] + ''
          ).includes(value)));
    }
    if (sortBy && sortDirection) {
      filteredData.sort((a: any, b: any) => {
        const result = (
          a[sortBy] + ''
        ).localeCompare(b[sortBy] + '');
        return sortDirection === 'asc' ? result : result * -1;
      });
    }
    return {
      rows: filteredData.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
      pageSize,
      pageIndex,
      total: filteredData.length,
      sortDirection,
      sortBy,
      filter,
    };
  });
}
