import { Directive, TemplateRef, inject } from '@angular/core';

export interface DataGridEditCellDefDirectiveContext<T extends Record<string, any> = Record<string, any>> {
  $implicit: T[keyof T];
  data: T;
}

@Directive({
  selector: '[rxapDataGridEditCellDef]',
  standalone: true,
})
export class DataGridEditCellDefDirective<T extends Record<string, any>> {
  template = inject<TemplateRef<DataGridEditCellDefDirectiveContext<T>>>(TemplateRef);

  public static ngTemplateContextGuard<T extends Record<string, any>>(
    dir: DataGridEditCellDefDirective<T>,
    ctx: any,
  ): ctx is DataGridEditCellDefDirectiveContext<T> {
    return true;
  }
}
