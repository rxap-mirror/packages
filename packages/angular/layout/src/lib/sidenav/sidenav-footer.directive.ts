import {
  Directive,
  Inject,
  TemplateRef,
} from '@angular/core';

@Directive({
  selector: '[rxapSidenavFooter]',
  standalone: true,
})
export class SidenavFooterDirective {
  constructor(
    @Inject(TemplateRef)
    public readonly template: TemplateRef<void>,
  ) {
  }
}
