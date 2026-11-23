import { Directive, TemplateRef, inject } from '@angular/core';
import { Showcase } from '@ng-prism/core';

export interface DataGridHeaderCellDefDirectiveContext {
  $implicit: string;
}

@Showcase({
  title: 'Data Grid Header Cell Def',
  description: 'Replaces the header cell of a data grid row. The template is rendered with the row name as implicit context.',
  status: 'stable',
  partOf: 'rxap-data-grid',
})
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
