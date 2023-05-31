import {
  Directive,
  Inject,
  Optional,
  Self,
  SkipSelf,
  Input,
  forwardRef
} from '@angular/core';
import {
  FormControlName,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ControlContainer,
  Validator,
  ValidatorFn,
  AsyncValidator,
  AsyncValidatorFn,
  ControlValueAccessor,
  NgControl
} from '@angular/forms';
import { RxapFormControl } from '../form-control';

/**
 * A full exertion of FormControlName from @angular/forms. The only change is the
 * ability to access the control container outside of the current component
 *
 * @deprecated use the ParentControlContainerDirective
 */
@Directive({
  selector:   '[rxapFormControlName]',
  providers:  [
    {
      provide:     NgControl,
      useExisting: forwardRef(() => FormControlNameDirective)
    }
  ],
  exportAs:   'rxapFormControl',
  standalone: true
})
export class FormControlNameDirective extends FormControlName {

  readonly control!: RxapFormControl;

  @Input('rxapFormControlName')
  public name!: string|number|null;

  constructor(
    @Optional() @SkipSelf() parent: ControlContainer,
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: Array<Validator|ValidatorFn>,
    @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
      Array<AsyncValidator|AsyncValidatorFn>,
    @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
  ) {
    super(parent, validators, asyncValidators, valueAccessors, null);
  }

}
