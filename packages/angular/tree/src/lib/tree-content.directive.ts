import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: 'ng-template[rxapTreeContent]',
  standalone: true,
})
export class TreeContentDirective {
  readonly template = inject<TemplateRef<any>>(TemplateRef);
}
