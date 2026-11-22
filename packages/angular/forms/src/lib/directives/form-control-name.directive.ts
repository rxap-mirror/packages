import { Directive, forwardRef, inject } from '@angular/core';
import {
  AsyncValidator,
  AsyncValidatorFn,
  ControlContainer,
  ControlValueAccessor,
  FormControlName,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { RxapFormControl } from '../form-control';

/**
 * A full exertion of FormControlName from @angular/forms. The only change is the
 * ability to access the control container outside of the current component
 *
 * @deprecated use the ParentControlContainerDirective
 */
@Directive({
  selector: '[rxapFormControlName]',
  providers: [
    {
      provide: NgControl,
      useExisting: forwardRef(() => FormControlNameDirective),
    },
  ],
  // the base class declares the `name` input (alias formControlName); re-alias it to rxapFormControlName
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [ { name: 'name', alias: 'rxapFormControlName' } ],
  exportAs: 'rxapFormControl',
  standalone: true,
})
export class FormControlNameDirective extends FormControlName {

  override readonly control!: RxapFormControl;

  constructor() {
    const parent = inject(ControlContainer, { optional: true, skipSelf: true })!;
    const validators = inject<Array<Validator | ValidatorFn>>(NG_VALIDATORS, { optional: true, self: true }) ?? [];
    const asyncValidators = inject<Array<AsyncValidator | AsyncValidatorFn>>(NG_ASYNC_VALIDATORS, { optional: true, self: true }) ?? [];
    const valueAccessors = [ ...(inject(NG_VALUE_ACCESSOR, { optional: true, self: true }) ?? []) ];

    super(parent, validators, asyncValidators, valueAccessors, null);
  }

}
