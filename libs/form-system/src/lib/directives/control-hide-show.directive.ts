import {
  Directive,
  Input,
  Inject,
  OnInit,
  Renderer2,
  ElementRef,
  OnDestroy,
  NgModule,
  Optional,
  Self
} from '@angular/core';
import {
  FormDefinition,
  AbstractControl,
  RxapFormControl
} from '@rxap/forms';
import {
  ControlContainer,
  NgControl
} from '@angular/forms';
import { Mixin } from '@rxap/mixin';
import {
  Subscription,
  of
} from 'rxjs';
import {
  tap,
  startWith,
  catchError
} from 'rxjs/operators';
import { ExtractControlMixin } from '../mixins/extract-control.mixin';
import { ExtractFormDefinitionMixin } from '../mixins/extract-form-definition.mixin';
import {
  setMetadataMap,
  getMetadata
} from '@rxap/utilities/reflect-metadata';

export const RXAP_FORM_SYSTEM_SHOW_METADATA     = 'rxap/form-system/show-function';
export const RXAP_FORM_SYSTEM_HIDE_METADATA     = 'rxap/form-system/hide-function';
export const RXAP_FORM_SYSTEM_HIDE_SHOW_OPTIONS = 'rxap/form-system/hide-show-options';

export type ControlHideShowFunction<T extends FormDefinition = FormDefinition> = (this: T, control: AbstractControl) => boolean | null;

export interface ControlHideShowOptions {
  /**
   * Weather the hide/showFunction should be called on root group changes
   */
  rootChange?: boolean;
}

export function UseHideFunction<T extends FormDefinition>(hideFunction: ControlHideShowFunction<T>, options: ControlHideShowOptions = {}) {
  return function (target: T, propertyKey: string) {
    setMetadataMap(propertyKey, hideFunction, RXAP_FORM_SYSTEM_HIDE_METADATA, target);
    if (Object.keys(options).length) {
      setMetadataMap(propertyKey, options, RXAP_FORM_SYSTEM_HIDE_SHOW_OPTIONS, target);
    }
  };
}

export function UseShowFunction<T extends FormDefinition>(showFunction: ControlHideShowFunction<T>, options: ControlHideShowOptions = {}) {
  return function (target: T, propertyKey: string) {
    setMetadataMap(propertyKey, showFunction, RXAP_FORM_SYSTEM_SHOW_METADATA, target);
    if (Object.keys(options).length) {
      setMetadataMap(propertyKey, options, RXAP_FORM_SYSTEM_HIDE_SHOW_OPTIONS, target);
    }
  };
}

export interface ControlHideShowDirective extends ExtractControlMixin,
                                                  ExtractFormDefinitionMixin {}

@Mixin(ExtractControlMixin, ExtractFormDefinitionMixin)
@Directive({
  selector: '[rxapControlHideShow]'
})
export class ControlHideShowDirective implements OnInit, OnDestroy {

  @Input('rxapControlHideShow')
  public controlId?: string;

  public control!: RxapFormControl;

  private subscription = new Subscription();

  constructor(
    @Inject(Renderer2)
    private readonly renderer: Renderer2,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef,
    @Optional()
    @Inject(ControlContainer)
    private readonly parent: ControlContainer | null,
    @Self()
    @Optional()
    @Inject(NgControl)
    private readonly ngControl: NgControl | null
  ) { }

  public ngOnInit() {

    if (!this.ngControl && !this.parent) {
      throw new Error('Easier the ControlContainer or NgControl must be injectable');
    }

    if (!this.ngControl && !this.controlId) {
      throw new Error('If the NgControl is not injectable then the control id must be defined!');
    }

    const control = this.ngControl?.control ?? this.extractControl(this.parent!, this.controlId!);

    if (!(control instanceof RxapFormControl)) {
      throw new Error('The control is not an instance of RxapFormControl');
    }

    this.control = control;

    const formDefinition = this.extractFormDefinition(control);

    const hideFunction = this.extractHideFunction(formDefinition);

    const showFunction = this.extractShowFunction(formDefinition);

    const options = this.extractOptions(formDefinition);

    let changeTrigger = formDefinition.rxapFormGroup.valueChanges;

    if (options.rootChange) {
      changeTrigger = formDefinition.rxapFormGroup.root.valueChanges;
    }

    changeTrigger = changeTrigger.pipe(startWith(null));

    if (showFunction) {
      this.subscription.add(
        changeTrigger.pipe(
          tap(() => {
            // TODO : resubscribe if the showFunction throws an error
            const show = showFunction.call(formDefinition, control);

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
          }),
        ).subscribe(),
      );
    }

    if (hideFunction) {
      this.subscription.add(
        changeTrigger.pipe(
          tap(() => {
            // TODO : resubscribe if the hideFunction throws an error
            const hide = hideFunction.call(formDefinition, control);

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
          }),
        ).subscribe(),
      );
    }

  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private extractOptions(formDefinition: FormDefinition): ControlHideShowOptions {
    const map = getMetadata<Map<string, ControlHideShowOptions>>(RXAP_FORM_SYSTEM_HIDE_SHOW_OPTIONS, Object.getPrototypeOf(formDefinition)) ?? null;

    if (!map || !map.has(this.control.controlId)) {
      return {};
    }

    return map.get(this.control.controlId)!;

  }

  private extractHideFunction(formDefinition: FormDefinition): ControlHideShowFunction | null {
    const map = getMetadata<Map<string, ControlHideShowFunction>>(RXAP_FORM_SYSTEM_HIDE_METADATA, Object.getPrototypeOf(formDefinition)) ?? null;

    if (!map || !map.has(this.control.controlId)) {
      return null;
    }

    return map.get(this.control.controlId)!;

  }

  private extractShowFunction(formDefinition: FormDefinition): ControlHideShowFunction | null {
    const map = getMetadata<Map<string, ControlHideShowFunction>>(RXAP_FORM_SYSTEM_SHOW_METADATA, Object.getPrototypeOf(formDefinition)) ?? null;

    if (!map || !map.has(this.control.controlId)) {
      return null;
    }

    return map.get(this.control.controlId)!;

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
  declarations: [ ControlHideShowDirective ],
  exports:      [ ControlHideShowDirective ]
})
export class ControlHideShowDirectiveModule {}
