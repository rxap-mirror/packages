import {
  Pipe,
  PipeTransform,
  NgModule,
} from '@angular/core';

@Pipe({
  name: 'replace',
})
export class ReplacePipe implements PipeTransform {

  public transform(value: string, replace: RegExp, replaceValue: string): string {
    return value ? value.replace(replace, replaceValue) : '';
  }

}

@NgModule({
  declarations: [ ReplacePipe ],
  exports:      [ ReplacePipe ],
})
export class ReplacePipeModule {}
