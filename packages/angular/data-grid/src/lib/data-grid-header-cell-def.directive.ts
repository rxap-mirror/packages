import {
  Directive,
  Inject,
  TemplateRef,
} from '@angular/core';

export interface DataGridHeaderCellDefDirectiveContext {
  $implicit: string;
}

@Directive({
  selector: '[rxapDataGridHeaderCellDef]',
  standalone: true,
})
export class DataGridHeaderCellDefDirective {
  public static ngTemplateContextGuard(
    dir: DataGridHeaderCellDefDirective,
    ctx: any,
  ): ctx is DataGridHeaderCellDefDirectiveContext {
    return true;
  }

  constructor(
    @Inject(TemplateRef)
    public template: TemplateRef<DataGridHeaderCellDefDirectiveContext>,
  ) {
  }
}
