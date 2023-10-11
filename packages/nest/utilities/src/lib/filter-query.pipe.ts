import {
  Injectable,
  PipeTransform,
} from '@nestjs/common';

export interface FilterQuery {
  column: string;
  filter: string;
}

function coerceArray<T>(value?: T | T[] | null): T[] {
  return value === null || value === undefined ? [] : Array.isArray(value) ? value : [ value ];
}

@Injectable()
export class FilterQueryPipe implements PipeTransform {

  public transform(value: string | string[] | undefined): FilterQuery[] {
    if (!value) {
      return [];
    }
    return coerceArray(value).map(item => {
      const [ column, filter ] = item.split('|');
      return { column, filter };
    });
  }

}
