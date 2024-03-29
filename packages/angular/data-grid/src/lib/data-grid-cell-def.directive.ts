import {
  Directive,
  Inject,
  TemplateRef,
} from '@angular/core';

export interface DataGridCellDefDirectiveContext<T extends Record<string, any> = Record<string, any>> {
  $implicit: T[keyof T];
  data: T;
}

@Directive({
  selector: '[rxapDataGridCellDef]',
  standalone: true,
})
export class DataGridCellDefDirective<T extends Record<string, any>> {
  public static ngTemplateContextGuard<T extends Record<string, any>>(
    dir: DataGridCellDefDirective<T>,
    ctx: any,
  ): ctx is DataGridCellDefDirectiveContext<T> {
    return true;
  }

  $implicit!: T[keyof T];
  data!: T;

  constructor(
    @Inject(TemplateRef)
    public template: TemplateRef<DataGridCellDefDirectiveContext<T>>,
  ) {
  }
}
