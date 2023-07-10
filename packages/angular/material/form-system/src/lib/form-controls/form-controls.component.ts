import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  isDevMode,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { FormDirective } from '@rxap/forms';
import {
  Observable,
  Subscription,
} from 'rxjs';
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
import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';
import '@angular/localize/init';

@Component({
  selector: 'rxap-form-controls',
  templateUrl: './form-controls.component.html',
  styleUrls: [ './form-controls.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexModule,
    MatButtonModule,
    ExtendedModule,
    NgClass,
    MatProgressSpinnerModule,
    NgIf,
    AsyncPipe,
    MatSnackBarModule,
  ],
})
export class FormControlsComponent<FormData> implements OnInit {
  public submitting$!: Observable<boolean>;
  public invalid = false;
  @Input()
  public navigateAfterSubmit?: string[];
  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-native
  public close = new EventEmitter<FormData | FormData[] | void>();
  @Output()
  public submitted = new EventEmitter<FormData>();
  public isDevMode = isDevMode();
  /**
   * Collection of successful submitted values
   * @private
   */
  private _submitted: FormData[] = [];

  constructor(
    @Inject(FormDirective)
    private readonly formDirective: FormDirective,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
    @Inject(MatSnackBar)
    private readonly snackBar: MatSnackBar,
    @Optional()
    @Inject(Router)
    private readonly router: Router | null,
  ) {
  }

  public _allowResubmit = false;

  public get allowResubmit(): boolean | '' {
    return this._allowResubmit;
  }

  @Input()
  public set allowResubmit(value: boolean | '') {
    this._allowResubmit = coerceBoolean(value);
  }

  public ngOnInit() {
    this.submitting$ = this.formDirective.submitting$;
    this.close
        .pipe(
          take(1),
          tap(() => {
            if (this.navigateAfterSubmit) {
              if (this.router) {
                return this.router.navigate(this.navigateAfterSubmit);
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
    this.invalid = false;
    this.formDirective.reset();
  }

  public cancel() {
    this.close.emit();
  }

  public submit(closeAfterSubmit?: boolean) {
    this.formDirective.form.markAllAsDirty();
    this.formDirective.form.markAllAsTouched();
    this.formDirective.cdr.markForCheck();
    // eslint-disable-next-line prefer-const
    let submitSubscription: Subscription;

    const invalidSubmitSubscription: Subscription =
      this.formDirective.invalidSubmit
          .pipe(
            take(1),
            tap(() => submitSubscription?.unsubscribe()),
            tap(() => (this.invalid = true)),
            tap(() => this.cdr.detectChanges()),
            tap(() =>
              this.snackBar.open(
                $localize`:@@rxap-material.form-system.form-controls.form-is-invalid:Form is not valid`,
                'ok',
                { duration: 5000 },
              ),
            ),
          )
          .subscribe();

    submitSubscription = this.formDirective.rxapSubmit
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
                                 this.invalid = false;
                                 this.cdr.detectChanges();
                               }),
                             )
                             .subscribe();

    this.formDirective.onSubmit(new Event('submit'));
  }

  public logCurrentFormState() {
    console.log(clone(this.formDirective.form.value));
  }
}
