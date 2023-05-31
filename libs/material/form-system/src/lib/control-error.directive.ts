import {
  Directive,
  Inject,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ChangeDetectorRef,
  AfterContentInit
} from '@angular/core';
import {
  MAT_LEGACY_FORM_FIELD as MAT_FORM_FIELD,
  MatLegacyFormField as MatFormField
} from '@angular/material/legacy-form-field';
import { controlErrorChanges$ } from '@rxap/forms';
import { Subscription } from 'rxjs';
import {
  ValidationErrors,
  AbstractControl
} from '@angular/forms';
import { tap } from 'rxjs/operators';
import { Required } from '@rxap/utilities';

export interface ControlErrorDirectiveContext {
  $implicit: any;
  control: AbstractControl;
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector:   '[rxapControlError]',
  standalone: true
})
export class ControlErrorDirective implements AfterContentInit, OnDestroy {
  static ngTemplateContextGuard<T>(
    dir: ControlErrorDirective,
    ctx: any
  ): ctx is ControlErrorDirectiveContext {
    return true;
  }

  @Input('rxapControlErrorKey')
  @Required
  public key!: string;

  private _subscription?: Subscription;

  private _control?: AbstractControl;

  constructor(
    @Inject(MAT_FORM_FIELD)
    private readonly formField: MatFormField,
    @Inject(TemplateRef)
    protected readonly template: TemplateRef<ControlErrorDirectiveContext>,
    @Inject(ViewContainerRef)
    protected readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef
  ) {}

  public ngAfterContentInit() {
    const control = this.formField._control.ngControl?.control;
    if (control) {
      this._control = control;
      this._subscription = controlErrorChanges$<ValidationErrors>(control)
        .pipe(tap((errors: ValidationErrors | null) => this.render(errors)))
        .subscribe();
    } else {
      throw new Error('The form field has not a control associated!');
    }
  }

  protected render(errors: ValidationErrors | null) {
    this.viewContainerRef.clear();
    if (errors) {
      const errorKeys = Object.keys(errors);
      const matchingKey = errorKeys.find((key) => key.toLowerCase() === this.key.toLowerCase());
      if (matchingKey) {
        const error = errors[ matchingKey ];
        if (!this._control) {
          throw new Error('The control is not defined!');
        }
        this.viewContainerRef.createEmbeddedView(this.template, {
          $implicit: error,
          control:   this._control,
        });
      }
    }
    this.cdr.detectChanges();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}


