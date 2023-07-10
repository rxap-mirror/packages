import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'replace',
  standalone: true,
})
export class ReplacePipe implements PipeTransform {

  public transform(value: string, replace: RegExp, replaceValue: string): string {
    return value ? value.replace(replace, replaceValue) : '';
  }

}


