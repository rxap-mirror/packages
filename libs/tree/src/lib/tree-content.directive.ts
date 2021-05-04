import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'ng-template[rxapTreeContent]'
})
export class TreeContentDirective {
  constructor(public readonly template: TemplateRef<any>) {}
}
