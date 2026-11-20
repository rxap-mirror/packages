import { Directive, TemplateRef, inject } from '@angular/core';

export interface DataGridHeaderCellDefDirectiveContext {
  $implicit: string;
}

@Directive({
  selector: '[rxapDataGridHeaderCellDef]',
  standalone: true,
})
export class DataGridHeaderCellDefDirective {
  template = inject<TemplateRef<DataGridHeaderCellDefDirectiveContext>>(TemplateRef);

  public static ngTemplateContextGuard(
    dir: DataGridHeaderCellDefDirective,
    ctx: any,
  ): ctx is DataGridHeaderCellDefDirectiveContext {
    return true;
  }
}
