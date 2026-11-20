import { Directive, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormDirective } from './form.directive';

@Directive({
  selector: '[rxapFormSubmitSuccessful]',
  standalone: true,
})
export class FormSubmitSuccessfulDirective {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly template = inject<TemplateRef<{ $implicit: any }>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);

  constructor() {
    outputToObservable(this.formDirective.submitSuccessful$).pipe(takeUntilDestroyed()).subscribe(result => {
      this.viewContainerRef.clear();
      this.viewContainerRef.createEmbeddedView(this.template, { $implicit: result });
    });
  }

}
