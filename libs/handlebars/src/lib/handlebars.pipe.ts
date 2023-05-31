import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { compile } from 'handlebars';

@Pipe({
  name:       'handlebars',
  standalone: true
})
export class HandlebarsPipe implements PipeTransform {

  transform(value: string, context: any): string {
    return compile(value)({ context });
  }

}


