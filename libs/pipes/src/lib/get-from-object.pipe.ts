import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { getFromObject } from '@rxap/utilities';

@Pipe({
  name:       'getFromObject',
  standalone: true
})
export class GetFromObjectPipe implements PipeTransform {
  transform(value: any, path: string): any {
    return getFromObject(value, path);
  }
}


