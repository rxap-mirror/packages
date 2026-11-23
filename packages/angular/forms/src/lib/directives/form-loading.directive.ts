import { Directive, effect, inject, TemplateRef, untracked, ViewContainerRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormDirective } from './form.directive';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Form Loading',
  description: 'Structural directive. Renders its template while the form loads its initial state. Use it as `*rxapFormLoading`.',
  status: 'stable',
  partOf: 'form[rxapForm]',
})
@Directive({
  selector: '[rxapFormLoading]',
  standalone: true,
})
export class FormLoadingDirective {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly template = inject<TemplateRef<void>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);

  private readonly state = toSignal(this.formDirective.loading$, { initialValue: false });

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
