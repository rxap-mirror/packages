import { Directive, effect, inject, TemplateRef, untracked, ViewContainerRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormDirective } from './form.directive';

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
