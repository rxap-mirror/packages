import {
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TimeagoFormatter } from './timeago.formatter';

@Pipe({
  name: 'timeago',
  standalone: true,
})
export class TimeagoPipe implements PipeTransform {

  transform(input: string | number | Date): string {
    return TimeagoFormatter(input);
  }

}
