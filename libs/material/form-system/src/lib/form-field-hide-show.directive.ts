import {
  AfterContentInit,
  Directive,
  ElementRef,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField
} from '@angular/material/form-field';
import {
  of,
  Subscription
} from 'rxjs';
import {
  FormDefinition,
  RxapFormControl
} from '@rxap/forms';
import { getMetadata } from '@rxap/utilities';
import {
  ControlHideShowFunction,
  ControlHideShowOptions,
  ExtractFormDefinitionMixin,
  RXAP_FORM_SYSTEM_HIDE_METADATA,
  RXAP_FORM_SYSTEM_HIDE_SHOW_OPTIONS,
  RXAP_FORM_SYSTEM_SHOW_METADATA
} from '@rxap/form-system';
import { Mixin } from '@rxap/mixin';
import {
  catchError,
  startWith,
  tap
} from 'rxjs/operators';

export class ExtractHideShowMixin {

  public controlId!: string;
  public control?: RxapFormControl;
  public formDefinition!: FormDefinition;

  public extractOptions(
    formDefinition: FormDefinition = this.formDefinition,
    controlId: string              = this.control?.controlId ?? this.controlId
  ): ControlHideShowOptions {
    const map = getMetadata<Map<string, ControlHideShowOptions>>(RXAP_FORM_SYSTEM_HIDE_SHOW_OPTIONS, Object.getPrototypeOf(formDefinition)) ?? null;

    if (!map || !map.has(controlId)) {
      return {};
    }

    return map.get(controlId)!;

  }

  public extractHideFunction(
    formDefinition: FormDefinition = this.formDefinition,
    controlId: string              = this.control?.controlId ?? this.controlId
  ): ControlHideShowFunction | null {
    const map = getMetadata<Map<string, ControlHideShowFunction>>(RXAP_FORM_SYSTEM_HIDE_METADATA, Object.getPrototypeOf(formDefinition)) ?? null;

    if (!map || !map.has(controlId)) {
      return null;
    }

    return map.get(controlId)!;

  }

  public extractShowFunction(
    formDefinition: FormDefinition = this.formDefinition,
    controlId: string              = this.control?.controlId ?? this.controlId
  ): ControlHideShowFunction | null {
    const map = getMetadata<Map<string, ControlHideShowFunction>>(RXAP_FORM_SYSTEM_SHOW_METADATA, Object.getPrototypeOf(formDefinition)) ?? null;

    if (!map || !map.has(controlId)) {
      return null;
    }

    return map.get(controlId)!;

  }

}

export interface FormFieldHideShowDirective extends ExtractHideShowMixin, ExtractFormDefinitionMixin, OnInit, OnDestroy {
}

// TODO : create mixin for hide and show logic (this class and ControlHideShowDirective in @rxap/form-system)

@Mixin(ExtractHideShowMixin, ExtractFormDefinitionMixin)
@Directive({
  selector: 'mat-form-field[rxapHideShow]'
})
export class FormFieldHideShowDirective implements AfterContentInit, OnDestroy {

  private subscription = new Subscription();
  public controlId!: string;
  public formDefinition!: FormDefinition;
  public control!: RxapFormControl;

  constructor(
    @Inject(MAT_FORM_FIELD)
    private readonly formField: MatFormField,
    @Inject(Renderer2)
    private readonly renderer: Renderer2,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef
  ) {
  }

  public ngAfterContentInit() {
    const control = this.formField._control.ngControl?.control;
    if (!control) {
      throw new Error('The form field has not a control associated!');
    }
    if (!(control instanceof RxapFormControl)) {
      throw new Error('The associated control is not a RxapFormControl');
    }
    this.control        = control;
    this.formDefinition = this.extractFormDefinition(control);
    const hideFunction  = this.extractHideFunction(this.formDefinition);
    const showFunction  = this.extractShowFunction(this.formDefinition);
    const options       = this.extractOptions(this.formDefinition);
    let changeTrigger   = this.formDefinition.rxapFormGroup.valueChanges;

    if (options.rootChange) {
      changeTrigger = this.formDefinition.rxapFormGroup.root.valueChanges;
    }

    changeTrigger = changeTrigger.pipe(startWith(null));
    if (showFunction) {
      this.subscription.add(
        changeTrigger.pipe(
          tap(() => {
            // TODO : resubscribe if the showFunction throws an error
            const show = showFunction.call(this.formDefinition, control);

            switch (show) {

              case true:
                this.show();
                break;

              case false:
                this.hide();
                break;

              case null:
                this.reset();
                break;

            }

          }),
          catchError(err => {
            console.error(err);
            return of(null);
          })
        ).subscribe()
      );
    }

    if (hideFunction) {
      this.subscription.add(
        changeTrigger.pipe(
          tap(() => {
            // TODO : resubscribe if the hideFunction throws an error
            const hide = hideFunction.call(this.formDefinition, control);

            switch (hide) {

              case true:
                this.hide();
                break;

              case false:
                this.show();
                break;

              case null:
                this.reset();
                break;

            }

          }),
          catchError(err => {
            console.error(err);
            return of(null);
          })
        ).subscribe()
      );
    }
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private hide() {
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
  }

  private show() {
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'block');
  }

  private reset() {
    this.renderer.removeStyle(this.elementRef.nativeElement, 'display');
  }

}

@NgModule({
  declarations: [ FormFieldHideShowDirective ],
  exports:      [ FormFieldHideShowDirective ]
})
export class FormFieldHideShowDirectiveModule {
}
