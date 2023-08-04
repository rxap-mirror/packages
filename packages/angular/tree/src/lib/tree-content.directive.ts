import {
  Directive,
  Inject,
  TemplateRef,
} from '@angular/core';

@Directive({
  selector: 'ng-template[rxapTreeContent]',
  standalone: true,
})
export class TreeContentDirective {
  constructor(
    @Inject(TemplateRef)
    public readonly template: TemplateRef<any>,
  ) {
  }
}
