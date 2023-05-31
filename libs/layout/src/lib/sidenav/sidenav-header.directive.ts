import {
  Directive,
  Inject,
  TemplateRef
} from '@angular/core';

@Directive({
  selector:   '[rxapSidenavHeader]',
  standalone: true
})
export class SidenavHeaderDirective {
  constructor(
    @Inject(TemplateRef)
    public readonly template: TemplateRef<void>
  ) {}
}
