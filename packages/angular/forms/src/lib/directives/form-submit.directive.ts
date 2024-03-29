import {
  Directive,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
} from '@angular/core';
import {
  clone,
  coerceBoolean,
} from '@rxap/utilities';
import { FormDirective } from './form.directive';
import {
  take,
  tap,
} from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmClick } from '@rxap/directives';

@Directive({
  selector: '[rxapFormSubmit]',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '(click)': 'onClick()',
    '(confirmed)': 'onConfirm()',
  },
  standalone: true,
})
export class FormSubmitDirective extends ConfirmClick implements OnDestroy {

  @HostBinding('type')
  @Input()
  public type = 'button';

  @Input()
  public set resetAfterSubmit(value: boolean | '') {
    this._resetAfterSubmit = coerceBoolean(value);
  }

  @Input()
  public navigateAfterSubmit?: string[];

  @Output()
  public afterSubmit = new EventEmitter();

  private _resetAfterSubmit = false;

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
        if (this._resetAfterSubmit) {
          this.formDirective.reset();
        }
        if (this.navigateAfterSubmit) {

          if (!this.router) {
            throw new Error('Could not resolve the router!');
          }

          return this.router.navigate(this.navigateAfterSubmit);
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
