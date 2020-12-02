import {
  Directive,
  TemplateRef
} from '@angular/core';

export interface DataGridHeaderCellDefDirectiveContext {
  $implicit: string;
}

@Directive({
  selector: '[rxapDataGridHeaderCellDef]'
})
export class DataGridHeaderCellDefDirective {

  public static ngTemplateContextGuard(dir: DataGridHeaderCellDefDirectiveContext, ctx: any):
    ctx is DataGridHeaderCellDefDirectiveContext {
    return true;
  }

  constructor(public template: TemplateRef<DataGridHeaderCellDefDirectiveContext>) {}
}
