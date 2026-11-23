import { Directive, effect, inject, TemplateRef, untracked, ViewContainerRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormDirective } from './form.directive';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Form Loading Error',
  description: 'Structural directive. Renders its template if loading the initial state failed. The error is the implicit context: `*rxapFormLoadingError="let error"`.',
  status: 'stable',
  partOf: 'form[rxapForm]',
})
@Directive({
  selector: '[rxapFormLoadingError]',
  standalone: true,
})
export class FormLoadingErrorDirective {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly template = inject<TemplateRef<{ $implicit: Error }>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);

  private readonly error = toSignal(this.formDirective.loadingError$, { initialValue: null });

  constructor() {
    effect(() => {
      const error = this.error();
      untracked(() => {
        this.viewContainerRef.clear();
        if (error !== null) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: error });
        }
      });
    });
  }

}
