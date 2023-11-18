import {
  Pipe,
  PipeTransform,
} from '@angular/core';

@Pipe({
  name: 'toUppercase',
  standalone: true,
})
export class ToUppercasePipe implements PipeTransform {
  transform(value: string): unknown {
    return value.toUpperCase();
  }
}
