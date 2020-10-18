import {
  Directive,
  TemplateRef,
} from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapDataGridHeaderCellDef]'
})
export class DataGridHeaderCellDefDirective {
  constructor(public template: TemplateRef<any>) {}
}
