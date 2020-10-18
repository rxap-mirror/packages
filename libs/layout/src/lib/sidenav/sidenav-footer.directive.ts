import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[rxapSidenavFooter]'
})
export class SidenavFooterDirective {

  constructor(public readonly template: TemplateRef<void>) { }

}
