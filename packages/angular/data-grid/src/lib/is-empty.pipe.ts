import {
  Pipe,
  PipeTransform,
} from '@angular/core';
import { getFromObject } from '@rxap/utilities';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'isEmpty',
  standalone: true,
})
export class IsEmptyPipe<T extends Record<string, unknown>> implements PipeTransform {

  transform(data: Observable<T>, path?: string): Observable<boolean> {
    if (!path) {
      throw new Error('FATAL: The path is required! Ensure the data grid row has a defined name property!');
    }
    return data.pipe(
      map(source => getFromObject(source, path)),
      map(value => value === null || value === undefined || value === ''),
    );
  }

}
