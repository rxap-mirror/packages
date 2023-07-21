import {
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { coerceArray } from '@rxap/utilities';

export interface FilterQuery {
  column: string;
  filter: string;
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
