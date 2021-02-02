import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ChangeDetectorRef,
  isDevMode
} from '@angular/core';
import { FormDirective } from '@rxap/forms';
import {
  Observable,
  Subscription
} from 'rxjs';
import {
  coerceBoolean,
  clone
} from '@rxap/utilities';
import {
  take,
  tap,
  map
} from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import '@angular/localize/init';

@Component({
  selector:        'rxap-form-controls',
  templateUrl:     './form-controls.component.html',
  styleUrls:       [ './form-controls.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'mfd-form-controls' }
})
export class FormControlsComponent<FormData> implements OnInit {

  @Input()
  public set allowResubmit(value: boolean | '') {
    this._allowResubmit = coerceBoolean(value);
  }

  public get allowResubmit(): boolean | '' {
    return this._allowResubmit;
  }

  public _allowResubmit: boolean = false;

  public submitting$!: Observable<boolean>;

  public invalid: boolean = false;

  @Input()
  public navigateAfterSubmit?: string[];

  @Output()
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
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly snackBar: MatSnackBar
  ) {
  }

  public ngOnInit() {
    this.submitting$ = this.formDirective.submitting$;
    this.close.pipe(
      take(1),
      tap(() => {
        if (this.navigateAfterSubmit) {
          return this.router.navigate(this.navigateAfterSubmit);
        }
        return Promise.resolve();
      })
    ).subscribe();
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
    let submitSubscription: Subscription;

    const invalidSubmitSubscription: Subscription = this.formDirective.invalidSubmit.pipe(
      take(1),
      tap(() => submitSubscription?.unsubscribe()),
      tap(() => this.invalid = true),
      tap(() => this.cdr.detectChanges()),
      tap(() => this.snackBar.open($localize`:@@rxap-material.form-system.form-controls.form-is-invalid:Form is not valid`, 'ok', { duration: 5000 }))
    ).subscribe();

    submitSubscription = this.formDirective.rxapSubmit.pipe(
      take(1),
      map(value => clone(value)),
      tap(value => this._submitted.push(value)),
      tap(value => this.submitted.emit(value)),
      tap(() => {
        if (closeAfterSubmit) {
          this.close.emit(this._submitted.length > 1 ? this._submitted : this._submitted[ 0 ]);
        } else {
          if (typeof this.formDirective.formDefinition.rxapReuse === 'function') {
            this.formDirective.formDefinition.rxapReuse();
          }
        }
      }),
      tap(() => invalidSubmitSubscription.unsubscribe()),
      tap(() => this.invalid = false),
      tap(() => this.cdr.detectChanges())
    ).subscribe();

    this.formDirective.onSubmit(new Event('submit'));
  }

  public logCurrentFormState() {
    console.log(clone(this.formDirective.form.value));
  }

}
