import { ChangeDetectionStrategy, Component, isDevMode, OnInit, input, output, inject, signal } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { FormDirective } from '@rxap/forms';
import { Subscription } from 'rxjs';
import {
  clone,
  coerceBoolean,
} from '@rxap/utilities';
import {
  take,
  tap,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
declare const $localize: any;

@Component({
    selector: 'rxap-form-controls',
    templateUrl: './form-controls.component.html',
    styleUrls: ['./form-controls.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    MatButtonModule,
    NgClass,
    MatProgressSpinnerModule,
    MatSnackBarModule
]
})
export class FormControlsComponent<FormData> implements OnInit {
  private readonly formDirective = inject<FormDirective>(FormDirective);
  private readonly snackBar = inject<MatSnackBar>(MatSnackBar);
  private readonly router = inject<Router | null>(Router, { optional: true });

  public readonly submitting = this.formDirective.submitting;
  public readonly invalid = signal(false);
  public readonly navigateAfterSubmit = input<string[]>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  public readonly close = output<FormData | FormData[] | void>();
  public readonly submitted = output<FormData>();
  public isDevMode = isDevMode();
  /**
   * Collection of successful submitted values
   * @private
   */
  private _submitted: FormData[] = [];

  public readonly allowResubmit = input(false, { transform: coerceBoolean });

  public ngOnInit() {
    outputToObservable(this.close)
        .pipe(
          take(1),
          tap(() => {
            const navigateAfterSubmit = this.navigateAfterSubmit();
            if (navigateAfterSubmit) {
              if (this.router) {
                return this.router.navigate(navigateAfterSubmit);
              } else {
                console.warn(
                  'The Router is not available. Ensure that tha RouterModule is imported',
                );
              }
            }
            return Promise.resolve();
          }),
        )
        .subscribe();
  }

  public reset() {
    this.invalid.set(false);
    this.formDirective.reset();
  }

  public cancel() {
    this.close.emit();
  }

  public submit(closeAfterSubmit?: boolean) {
    this.formDirective.form.markAllAsDirty();
    this.formDirective.form.markAllAsTouched();
    // eslint-disable-next-line prefer-const
    let submitSubscription: Subscription;

    const invalidSubmitSubscription: Subscription =
      outputToObservable(this.formDirective.invalidSubmit)
          .pipe(
            take(1),
            tap(() => submitSubscription?.unsubscribe()),
            tap(() => this.invalid.set(true)),
            tap(() =>
              this.snackBar.open(
                $localize`:@@rxap-material.form-system.form-controls.form-is-invalid:Form is not valid`,
                'ok',
                { duration: 5000 },
              ),
            ),
          )
          .subscribe();

    submitSubscription = outputToObservable(this.formDirective.rxapSubmit)
                             .pipe(
                               take(1),
                               tap((value) => {
                                 const clonedValue = clone(value);
                                 this._submitted.push(clonedValue);
                                 this.submitted.emit(clonedValue);

                                 if (closeAfterSubmit) {
                                   this.close.emit(
                                     this._submitted.length > 1 ? this._submitted : this._submitted[0],
                                   );
                                 } else {
                                   if (
                                     typeof this.formDirective.formDefinition.rxapReuse === 'function'
                                   ) {
                                     this.formDirective.formDefinition.rxapReuse();
                                   }
                                 }

                                 invalidSubmitSubscription.unsubscribe();
                                 this.invalid.set(false);
                               }),
                             )
                             .subscribe();

    this.formDirective.onSubmit(new Event('submit'));
  }

  public logCurrentFormState() {
    console.log(clone(this.formDirective.form.value));
  }
}
