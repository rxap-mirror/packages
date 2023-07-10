import {
  Directive,
  Inject,
  TemplateRef,
} from '@angular/core';

export interface ExpandCellContentDirectiveContext<Data extends Record<string, any>> {
  $implicit: Data
}

@Directive({
  selector: '[rxapExpandRowContent]',
  standalone: true,
})
export class ExpandRowContentDirective<Data extends Record<string, any>> {


  static ngTemplateContextGuard<Data extends Record<string, any>>(dir: ExpandRowContentDirective<Data>, ctx: any):
    ctx is ExpandCellContentDirectiveContext<Data> {
    return true;
  }

  constructor(
    @Inject(TemplateRef)
    public readonly template: TemplateRef<ExpandCellContentDirectiveContext<Data>>,
  ) {
  }

}
