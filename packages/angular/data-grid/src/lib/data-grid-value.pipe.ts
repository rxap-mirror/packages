import {
  Pipe,
  PipeTransform,
} from '@angular/core';
import { getFromObject } from '@rxap/utilities';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'dataGridValue',
  standalone: true,
})
export class DataGridValuePipe<T extends Record<string, unknown>> implements PipeTransform {

  public transform(data: Observable<T>, path?: string): Observable<unknown> {
    if (!path) {
      throw new Error('FATAL: The path is required! Ensure the data grid row has a defined name property!');
    }
    return data.pipe(
      map(source => getFromObject(source, path)),
    );
  }

}
