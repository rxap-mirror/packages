import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormDirective } from '@rxap/forms';
import { Observable } from 'rxjs';
import { coerceBoolean } from '@rxap/utilities';
import {
  take,
  tap
} from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector:        'rxap-form-controls',
  templateUrl:     './form-controls.component.html',
  styleUrls:       [ './form-controls.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'mfd-form-controls' }
})
export class FormControlsComponent implements OnInit {

  public set allowResubmit(value: boolean | '') {
    this._allowResubmit = coerceBoolean(value);
  }

  public get allowResubmit(): boolean | '' {
    return this._allowResubmit;
  }

  public _allowResubmit: boolean = false;

  public submitting$!: Observable<boolean>;

  @Input()
  public navigateAfterSubmit?: string[];

  @Output()
  public close = new EventEmitter<void>();

  constructor(
    @Inject(FormDirective)
    private readonly formDirective: FormDirective,
    private readonly router: Router
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
    if (closeAfterSubmit) {
      this.formDirective.rxapSubmit.pipe(
        take(1),
        tap(() => this.close.emit())
      ).subscribe();
    }
    this.formDirective.onSubmit(new Event('submit'));
  }

}
