import { Directive, TemplateRef, Inject } from '@angular/core';

export interface DataGridCellDefDirectiveContext<
  T extends Record<string, any> = Record<string, any>
> {
  $implicit: T[keyof T];
  data: T;
}

@Directive({
  selector: '[rxapDataGridCellDef]',
})
export class DataGridCellDefDirective<T extends Record<string, any>> {
  public static ngTemplateContextGuard<T extends Record<string, any>>(
    dir: DataGridCellDefDirectiveContext<T>,
    ctx: any
  ): ctx is DataGridCellDefDirectiveContext<T> {
    return true;
  }

  $implicit!: T[keyof T];
  data!: T;

  constructor(
    @Inject(TemplateRef)
    public template: TemplateRef<DataGridCellDefDirectiveContext<T>>
  ) {}
}
