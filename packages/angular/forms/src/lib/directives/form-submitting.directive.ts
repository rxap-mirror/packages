import { Directive, effect, inject, TemplateRef, untracked, ViewContainerRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormDirective } from './form.directive';

@Directive({
  selector: '[rxapFormSubmitting]',
  standalone: true,
})
export class FormSubmittingDirective {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly template = inject<TemplateRef<void>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);

  private readonly state = toSignal(this.formDirective.submitting$, { initialValue: false });

  constructor() {
    effect(() => {
      const active = this.state();
      untracked(() => {
        this.viewContainerRef.clear();
        if (active) {
          this.viewContainerRef.createEmbeddedView(this.template);
        }
      });
    });
  }

}
