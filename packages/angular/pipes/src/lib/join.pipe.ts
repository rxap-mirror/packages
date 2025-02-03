import {
  Pipe,
  PipeTransform,
} from '@angular/core';

@Pipe({
  name: 'join',
  pure: true,
  standalone: true,
})
export class JoinPipe implements PipeTransform {

  transform(list: any[], separator?: string): string {
    return list.join(separator);
  }

}
