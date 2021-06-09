import { Directive, Inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[rxapSidenavHeader]',
})
export class SidenavHeaderDirective {
  constructor(
    @Inject(TemplateRef)
    public readonly template: TemplateRef<void>
  ) {}
}
