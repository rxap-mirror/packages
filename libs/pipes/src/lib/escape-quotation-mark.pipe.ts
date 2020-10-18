import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { ReplacePipe } from './replace.pipe';

@Pipe({
  name: 'escapeQuotationMark'
})
export class EscapeQuotationMarkPipe implements PipeTransform {

  public transform(value: string, reverse: boolean = false): string {
    if (reverse) {
      return new ReplacePipe().transform(value, /\\"/g, '"');
    } else {
      return new ReplacePipe().transform(value, /"/g, '\"');
    }
  }

}

@NgModule({
  declarations: [ EscapeQuotationMarkPipe ],
  exports:      [ EscapeQuotationMarkPipe ]
})
export class EscapeQuotationMarkPipeModule {}
