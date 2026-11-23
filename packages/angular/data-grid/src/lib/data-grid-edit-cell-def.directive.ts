import { Directive, TemplateRef, inject } from '@angular/core';
import { Showcase } from '@ng-prism/core';

export interface DataGridEditCellDefDirectiveContext<T extends Record<string, any> = Record<string, any>> {
  $implicit: T[keyof T];
  data: T;
}

@Showcase({
  title: 'Data Grid Edit Cell Def',
  description: 'Defines the edit cell of a data grid row. The template replaces the view cell if the data grid is in the edit mode.',
  status: 'stable',
  partOf: 'rxap-data-grid',
})
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
