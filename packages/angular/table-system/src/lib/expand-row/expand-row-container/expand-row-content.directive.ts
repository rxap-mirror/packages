import { Directive, TemplateRef, inject } from '@angular/core';
import { Showcase } from '@ng-prism/core';

export interface ExpandCellContentDirectiveContext<Data extends Record<string, any>> {
  $implicit: Data;
}

@Showcase({
  title: 'Expand Row Content (Basic)',
  description: 'Template with the content of an expandable row. The template is rendered by the expand row container with the row element as implicit context.',
  status: 'stable',
  partOf: 'td[rxap-expand-row]',
})
@Directive({
  selector: '[rxapExpandRowContent]',
  standalone: true,
})
export class ExpandRowContentDirective<Data extends Record<string, any>> {
  readonly template = inject<TemplateRef<ExpandCellContentDirectiveContext<Data>>>(TemplateRef);



  static ngTemplateContextGuard<Data extends Record<string, any>>(dir: ExpandRowContentDirective<Data>, ctx: any):
    ctx is ExpandCellContentDirectiveContext<Data> {
    return true;
  }

}
