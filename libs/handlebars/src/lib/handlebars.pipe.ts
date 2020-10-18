import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { compile } from 'handlebars';

@Pipe({
  name: 'handlebars'
})
export class HandlebarsPipe implements PipeTransform {

  transform(value: string, context: any): string {
    return compile(value)({ context });
  }

}

@NgModule({
  declarations: [ HandlebarsPipe ],
  exports:      [ HandlebarsPipe ]
})
export class HandlebarsPipeModule {}
