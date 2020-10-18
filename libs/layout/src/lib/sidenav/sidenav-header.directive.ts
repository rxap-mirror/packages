import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[rxapSidenavHeader]'
})
export class SidenavHeaderDirective {

  constructor(public readonly template: TemplateRef<void>) { }

}
