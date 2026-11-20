import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[rxapSidenavFooter]',
  standalone: true,
})
export class SidenavFooterDirective {
  readonly template = inject<TemplateRef<void>>(TemplateRef);
}
