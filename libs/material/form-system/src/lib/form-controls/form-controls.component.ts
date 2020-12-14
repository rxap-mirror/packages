import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ChangeDetectorRef
} from '@angular/core';
import { FormDirective } from '@rxap/forms';
import {
  Observable,
  Subscription
} from 'rxjs';
import { coerceBoolean } from '@rxap/utilities';
import {
  take,
  tap
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
  public close = new EventEmitter<FormData | void>();

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
      tap(() => this.snackBar.open($localize`:@@rxap-material.form-system.form-controls.form-is-invalid:Form is not valid`))
    ).subscribe();
    let submitHandle                              = this.formDirective.rxapSubmit.pipe(
      take(1)
    );
    if (closeAfterSubmit) {
      submitHandle = submitHandle.pipe(
        tap(value => this.close.emit(value))
      );
    }
    submitSubscription = submitHandle.pipe(
      tap(() => invalidSubmitSubscription.unsubscribe())
    ).subscribe();
    this.formDirective.onSubmit(new Event('submit'));
  }

}
