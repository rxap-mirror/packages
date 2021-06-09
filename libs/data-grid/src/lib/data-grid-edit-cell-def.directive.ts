import { Directive, Inject, TemplateRef } from '@angular/core';
import { FormDirective, RxapFormGroup } from '@rxap/forms';

export interface DataGridEditCellDefDirectiveContext<
  T extends Record<string, any> = Record<string, any>
> {
  $implicit: RxapFormGroup<T>;
  formDirective: FormDirective<T>;
}

@Directive({
  selector: '[rxapDataGridEditCellDef]',
})
export class DataGridEditCellDefDirective<T extends Record<string, any>> {
  public static ngTemplateContextGuard<T extends Record<string, any>>(
    dir: DataGridEditCellDefDirectiveContext<T>,
    ctx: any
  ): ctx is DataGridEditCellDefDirectiveContext<T> {
    return true;
  }

  constructor(
    @Inject(TemplateRef)
    public template: TemplateRef<DataGridEditCellDefDirectiveContext<T>>
  ) {}
}
