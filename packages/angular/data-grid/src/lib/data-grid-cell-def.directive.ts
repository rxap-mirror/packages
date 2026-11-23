import { Directive, TemplateRef, inject } from '@angular/core';
import { Showcase } from '@ng-prism/core';

export interface DataGridCellDefDirectiveContext<T extends Record<string, any> = Record<string, any>> {
  $implicit: T[keyof T];
  data: T;
}

@Showcase({
  title: 'Data Grid Cell Def',
  description: 'Replaces the view cell of a data grid row. The template is rendered with the property value as implicit context and the complete data as data context.',
  status: 'stable',
  partOf: 'rxap-data-grid',
})
@Directive({
  selector: '[rxapDataGridCellDef]',
  standalone: true,
})
export class DataGridCellDefDirective<T extends Record<string, any>> {
  template = inject<TemplateRef<DataGridCellDefDirectiveContext<T>>>(TemplateRef);

  public static ngTemplateContextGuard<T extends Record<string, any>>(
    dir: DataGridCellDefDirective<T>,
    ctx: any,
  ): ctx is DataGridCellDefDirectiveContext<T> {
    return true;
  }

  $implicit!: T[keyof T];
  data!: T;
}
