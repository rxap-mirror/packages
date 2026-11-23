import { computed, Directive, inject, input, OnDestroy, output } from '@angular/core';
import { outputToObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ConfirmClick } from '@rxap/directives';
import {
  clone,
  coerceBoolean,
} from '@rxap/utilities';
import { Subscription } from 'rxjs';
import {
  take,
  tap,
} from 'rxjs/operators';
import { FormDirective } from './form.directive';
import { Showcase } from '@ng-prism/core';

const PRISM_FORM_STYLE = 'display: flex; flex-direction: column; gap: 8px; min-width: 280px';

@Showcase<FormSubmitDirective>({
  title: 'Form Submit',
  category: 'Forms',
  description: 'A button that marks the whole form as dirty and touched and submits it. Submit the form with the name `fail` to see the failing submit.',
  status: 'stable',
  imports: [ { name: 'ReactiveFormsModule', from: '@angular/forms' } ],
  host: {
    template: `<form rxapForm style="${ PRISM_FORM_STYLE }"><label>Name <input formControlName="name" /></label><label>Email <input formControlName="email" type="email" /></label><div><button rxapFormSubmit>Submit</button></div></form>`,
  },
  variants: [
    { name: 'Default' },
    { name: 'Reset after submit', inputs: { resetAfterSubmit: true } },
    { name: 'Not disabled while submitting', inputs: { disableWhileSubmitting: false } },
  ],
})
@Directive({
  selector: '[rxapFormSubmit]',

  host: {
    '[disabled]': 'disabled()',
    '[type]': 'type()',
  },
  standalone: true,
  exportAs: 'rxapFormSubmit',
})
export class FormSubmitDirective extends ConfirmClick implements OnDestroy {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly router = inject<Router | null>(Router, { optional: true }) ?? null;


  public readonly type = input<'button' | 'submit' | 'reset'>('button');

  public readonly resetAfterSubmit = input<boolean | '', boolean>(false, { transform: coerceBoolean });

  public readonly navigateAfterSubmit = input<string[]>();

  public readonly afterSubmit = output<any>();

  public readonly disableWhileSubmitting = input(true);

  public readonly submitting = toSignal(this.formDirective.submitting$, { initialValue: false });

  public readonly disabled = computed(() => this.disableWhileSubmitting() && this.submitting())

  private subscription?: Subscription;

  protected execute() {
    this.formDirective.form.markAllAsDirty();
    this.formDirective.form.markAllAsTouched();
    this.subscription = outputToObservable(this.formDirective.rxapSubmit).pipe(
      take(1),
      tap(value => {
        const clonedValue = clone(value);
        this.afterSubmit.emit(clonedValue);
        if (this.resetAfterSubmit()) {
          this.formDirective.reset();
        }
        const navigateAfterSubmit = this.navigateAfterSubmit();
        if (Array.isArray(navigateAfterSubmit)) {

          if (!this.router) {
            throw new Error('Could not resolve the router!');
          }

          return this.router.navigate(navigateAfterSubmit);
        }
        return Promise.resolve();
      }),
    ).subscribe();
    this.formDirective.onSubmit(new Event('submit'));
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
