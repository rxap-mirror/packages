import {
  Directive,
  TemplateRef,
  Inject
} from '@angular/core';

export interface ExpandCellContentDirectiveContext<Data extends Record<string, any>> {
  $implicit: Data
}

@Directive({
  selector: '[rxapExpandRowContent]'
})
export class ExpandRowContentDirective<Data extends Record<string, any>> {


  static ngTemplateContextGuard<Data extends Record<string, any>>(dir: ExpandCellContentDirectiveContext<Data>, ctx: any):
    ctx is ExpandCellContentDirectiveContext<Data> {
    return true;
  }

  constructor(
    @Inject(TemplateRef)
    public readonly template: TemplateRef<ExpandCellContentDirectiveContext<Data>>
  ) {}

}
