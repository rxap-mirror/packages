import {
  Directive,
  TemplateRef,
} from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapDataGridCellDef]'
})
export class DataGridCellDefDirective {
  constructor(public template: TemplateRef<any>) {}
}
