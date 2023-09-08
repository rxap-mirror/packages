import {
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  interval,
  map,
  startWith,
} from 'rxjs';
import { TimeagoFormatter } from './timeago.formatter';

@Pipe({
  name: 'timeago',
  standalone: true,
})
export class TimeagoPipe implements PipeTransform {

  transform(input: string | number | Date, live = false) {
    const date = new Date(input);

    const timeago = TimeagoFormatter(date);

    if (live) {
      return interval(1000).pipe(
        map(() => TimeagoFormatter(date)),
        startWith(timeago),
      );
    }

    return timeago;
  }

}
