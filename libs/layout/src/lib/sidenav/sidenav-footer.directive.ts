import { Directive, TemplateRef, Inject } from '@angular/core';

@Directive({
  selector: '[rxapSidenavFooter]',
})
export class SidenavFooterDirective {
  constructor(
    @Inject(TemplateRef)
    public readonly template: TemplateRef<void>
  ) {}
}
