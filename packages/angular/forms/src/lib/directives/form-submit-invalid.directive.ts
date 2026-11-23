import { Directive, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormDirective } from './form.directive';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Form Submit Invalid',
  description: 'Structural directive. Renders its template if the form was submitted while invalid. The errors of the invalid controls are the implicit context: `*rxapFormSubmitInvalid="let errors"`.',
  status: 'stable',
  partOf: 'form[rxapForm]',
})
@Directive({
  selector: '[rxapFormSubmitInvalid]',
  standalone: true,
})
export class FormSubmitInvalidDirective {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly template = inject<TemplateRef<{ $implicit: any }>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);

  constructor() {
    outputToObservable(this.formDirective.invalidSubmit).pipe(takeUntilDestroyed()).subscribe(result => {
      this.viewContainerRef.clear();
      this.viewContainerRef.createEmbeddedView(this.template, { $implicit: result });
    });
  }

}
