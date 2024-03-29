import {
  AfterContentInit,
  ChangeDetectorRef,
  Directive,
  Inject,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  MAT_FORM_FIELD,
  MatFormField,
} from '@angular/material/form-field';
import { controlErrorChanges$ } from '@rxap/forms';
import { Required } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ControlErrorDirectiveContext {
  $implicit: any;
  control: AbstractControl;
}

@Directive({
  selector: '[rxapControlError]',
  standalone: true,
})
export class ControlErrorDirective implements AfterContentInit, OnDestroy {
  @Input({
    required: true,
    alias: 'rxapControlErrorKey',
  })
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
    protected readonly cdr: ChangeDetectorRef,
  ) {
  }

  static ngTemplateContextGuard<T>(
    dir: ControlErrorDirective,
    ctx: any,
  ): ctx is ControlErrorDirectiveContext {
    return true;
  }

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

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  protected render(errors: ValidationErrors | null) {
    this.viewContainerRef.clear();
    if (errors) {
      const errorKeys = Object.keys(errors);
      const matchingKey = errorKeys.find((key) => key.toLowerCase() === this.key.toLowerCase());
      if (matchingKey) {
        const error = errors[matchingKey];
        if (!this._control) {
          throw new Error('The control is not defined!');
        }
        this.viewContainerRef.createEmbeddedView(this.template, {
          $implicit: error,
          control: this._control,
        });
      }
    }
    this.cdr.detectChanges();
  }
}


