import { Directive, TemplateRef, Inject } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'ng-template[rxapTreeContent]',
})
export class TreeContentDirective {
  constructor(
    @Inject(TemplateRef)
    public readonly template: TemplateRef<any>
  ) {}
}
