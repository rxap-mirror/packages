import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[rxapSidenavHeader]',
  standalone: true,
})
export class SidenavHeaderDirective {
  readonly template = inject<TemplateRef<void>>(TemplateRef);
}
