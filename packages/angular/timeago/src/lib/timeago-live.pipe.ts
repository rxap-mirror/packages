import {
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  interval,
  map,
  Observable,
  startWith,
} from 'rxjs';
import { TimeagoFormatter } from './timeago.formatter';

@Pipe({
  name: 'timeagoLive',
  standalone: true,
})
export class TimeagoLivePipe implements PipeTransform {

  transform(input: string | number | Date): Observable<string> {
    return interval(1000).pipe(
      map(() => TimeagoFormatter(input)),
      startWith(TimeagoFormatter(input)),
    );
  }

}
