import {
  Directive,
  Inject,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  NgModule,
  ChangeDetectorRef,
  AfterContentInit,
} from '@angular/core';
import { MAT_FORM_FIELD, MatFormField } from '@angular/material/form-field';
import { controlErrorChanges$ } from '@rxap/forms';
import { Subscription } from 'rxjs';
import { ValidationErrors, AbstractControl } from '@angular/forms';
import { tap } from 'rxjs/operators';

export interface ControlErrorsDirectiveContext {
  $implicit: ValidationErrors;
  control: AbstractControl;
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapControlErrors]',
})
export class ControlErrorsDirective implements AfterContentInit, OnDestroy {
  static ngTemplateContextGuard<T>(
    dir: ControlErrorsDirectiveContext,
    ctx: any
  ): ctx is ControlErrorsDirectiveContext {
    return true;
  }

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

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}

@NgModule({
  declarations: [ControlErrorsDirective],
  exports: [ControlErrorsDirective],
})
export class ControlErrorsDirectiveModule {}
