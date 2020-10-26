import {
  Directive,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  NgModule,
  ChangeDetectorRef
} from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField
} from '@angular/material/form-field';
import { RxapFormControl } from '@rxap/forms';
import { Subscription } from 'rxjs';
import { ValidationErrors } from '@angular/forms';
import { tap } from 'rxjs/operators';

export interface ControlErrorsDirectiveContext {
  $implicit: ValidationErrors;
  control: RxapFormControl;
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapControlErrors]'
})
export class ControlErrorsDirective implements OnInit, OnDestroy {

  static ngTemplateContextGuard<T>(dir: ControlErrorsDirectiveContext, ctx: any):
    ctx is ControlErrorsDirectiveContext {
    return true;
  }

  private _subscription?: Subscription;

  private _control!: RxapFormControl;

  constructor(
    @Inject(MAT_FORM_FIELD)
    private readonly formField: MatFormField,
    protected readonly template: TemplateRef<ControlErrorsDirectiveContext>,
    protected readonly viewContainerRef: ViewContainerRef,
    protected readonly cdr: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    const control = this.formField._control.ngControl?.control;
    if (!(control instanceof RxapFormControl)) {
      throw new Error('Could not extract the form control!');
    }
    this._control      = control;
    this._subscription = control.errors$.pipe(
      tap((errors: ValidationErrors | null) => this.render(errors))
    ).subscribe();
  }

  protected render(errors: ValidationErrors | null) {
    this.viewContainerRef.clear();
    if (errors) {
      this.viewContainerRef.createEmbeddedView(this.template, { $implicit: errors, control: this._control });
    }
    this.cdr.detectChanges();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

}

@NgModule({
  declarations: [ ControlErrorsDirective ],
  exports:      [ ControlErrorsDirective ]
})
export class ControlErrorsDirectiveModule {}
