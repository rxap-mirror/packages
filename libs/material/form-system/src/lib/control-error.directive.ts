import {
  Directive,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  NgModule
} from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField
} from '@angular/material/form-field';
import { RxapFormControl } from '@rxap/forms';
import { Subscription } from 'rxjs';
import { ValidationErrors } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { Required } from '@rxap/utilities';

export interface ControlErrorDirectiveContext {
  $implicit: any;
  control: RxapFormControl;
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapControlError]'
})
export class ControlErrorDirective implements OnInit, OnDestroy {

  static ngTemplateContextGuard<T>(dir: ControlErrorDirectiveContext, ctx: any):
    ctx is ControlErrorDirectiveContext {
    return true;
  }

  @Input('rxapControlErrorKey')
  @Required
  public key!: string;

  private _subscription?: Subscription;

  private _control!: RxapFormControl;

  constructor(
    @Inject(MAT_FORM_FIELD)
    private readonly formField: MatFormField,
    protected readonly template: TemplateRef<ControlErrorDirectiveContext>,
    protected readonly viewContainerRef: ViewContainerRef
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
    if (errors && errors.hasOwnProperty(this.key)) {
      const error = errors[ this.key ];
      this.viewContainerRef.createEmbeddedView(this.template, { $implicit: error, control: this._control });
    }
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

}

@NgModule({
  declarations: [ ControlErrorDirective ],
  exports:      [ ControlErrorDirective ]
})
export class ControlErrorDirectiveModule {}
