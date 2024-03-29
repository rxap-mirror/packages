import {
  AfterContentInit,
  ChangeDetectorRef,
  Directive,
  Inject,
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
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ControlErrorsDirectiveContext {
  $implicit: ValidationErrors;
  control: AbstractControl;
}

@Directive({
  selector: '[rxapControlErrors]',
  standalone: true,
})
export class ControlErrorsDirective implements AfterContentInit, OnDestroy {
  private _subscription?: Subscription;
  private _control?: AbstractControl;

  constructor(
    @Inject(MAT_FORM_FIELD)
    private readonly formField: MatFormField,
    @Inject(TemplateRef)
    protected readonly template: TemplateRef<ControlErrorsDirectiveContext>,
    @Inject(ViewContainerRef)
    protected readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
  ) {
  }

  static ngTemplateContextGuard<T>(
    dir: ControlErrorsDirective,
    ctx: any,
  ): ctx is ControlErrorsDirectiveContext {
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
      if (!this._control) {
        throw new Error('The control is not defined!');
      }
      this.viewContainerRef.createEmbeddedView(this.template, {
        $implicit: errors,
        control: this._control,
      });
    }
    this.cdr.detectChanges();
  }
}


