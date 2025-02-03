import {
  Pipe,
  PipeTransform,
} from '@angular/core';

@Pipe({
  name: 'slice',
  standalone: true,
})
export class SlicePipe implements PipeTransform {

  transform<T>(value: readonly T[], start: number, end?: number): T[] {
    return value.slice(start, end);
  }

}
