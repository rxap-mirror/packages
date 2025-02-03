import {
  Pipe,
  PipeTransform,
} from '@angular/core';

@Pipe({
  name: 'limit',
  standalone: true,
})
export class LimitPipe implements PipeTransform {

  transform<T>(value: readonly T[], limit: number): T[] {
    return value.slice(0, limit);
  }

}
