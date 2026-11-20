import { Directive, TemplateRef, inject } from '@angular/core';

export interface ExpandCellContentDirectiveContext<Data extends Record<string, any>> {
  $implicit: Data;
}

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
