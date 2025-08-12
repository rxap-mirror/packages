import {
  computed,
  Directive,
  Inject,
  input,
  OnDestroy,
  Optional,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

@Directive({
  selector: '[rxapFormSubmit]',

  host: {
    '(click)': 'onClick()',
    '(confirmed)': 'onConfirm()',
    '[disabled]': 'disabled()',
    '[type]': 'type()',
  },
  standalone: true,
  exportAs: 'rxapFormSubmit',
})
export class FormSubmitDirective extends ConfirmClick implements OnDestroy {

  public type = input<'button' | 'submit' | 'reset'>('button');

  resetAfterSubmit = input<boolean | '', boolean>(false, { transform: coerceBoolean });

  public navigateAfterSubmit = input<string[]>();

  public afterSubmit = output<any>();

  disableWhileSubmitting = input(true);

  submitting = toSignal(this.formDirective.submitting$, { initialValue: false });

  disabled = computed(() => this.disableWhileSubmitting() && this.submitting())

  private subscription?: Subscription;

  constructor(
    @Inject(FormDirective) private readonly formDirective: FormDirective,
    @Optional()
    @Inject(Router)
    private readonly router: Router | null = null,
  ) {
    super();
  }

  protected execute() {
    this.formDirective.form.markAllAsDirty();
    this.formDirective.form.markAllAsTouched();
    this.formDirective.cdr.markForCheck();
    this.subscription = this.formDirective.rxapSubmit.pipe(
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
