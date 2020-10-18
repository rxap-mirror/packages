import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { getFromObject } from '@rxap/utilities';

@Pipe({
  name: 'getFromObject'
})
export class GetFromObjectPipe implements PipeTransform {
  transform(value: any, path: string): any {
    return getFromObject(value, path);
  }
}

@NgModule({
  exports:      [ GetFromObjectPipe ],
  declarations: [ GetFromObjectPipe ]
})
export class GetFromObjectPipeModule {}
