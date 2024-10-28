import {
  Inject,
  Injectable,
  Optional,
  PipeTransform,
} from '@nestjs/common';

export interface FilterQuery {
  column: string;
  filter: string;
}

function coerceArray<T>(value?: T | T[] | null): T[] {
  return value === null || value === undefined ? [] : Array.isArray(value) ? value : [ value ];
}

export const DEFAULT_FILTER_QUERY_PIPE_DELIMITER = Symbol('DEFAULT_FILTER_QUERY_PIPE_DELIMITER');

@Injectable()
export class FilterQueryPipe implements PipeTransform {

  constructor(
    @Optional()
    @Inject(DEFAULT_FILTER_QUERY_PIPE_DELIMITER)
    private readonly delimiter = '|'
  ) {}

  public transform(value: string | string[] | FilterQuery | FilterQuery[] | undefined): FilterQuery[] {
    if (!value) {
      return [];
    }
    return coerceArray(value).map(item => {
      if (typeof item === 'object') {
        return item;
      }
      const [ column, filter ] = item.split(this.delimiter);
      return { column, filter };
    });
  }

}
