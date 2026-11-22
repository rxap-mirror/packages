import { Directive, forwardRef, inject } from '@angular/core';
import {
  ControlContainer,
  AsyncValidator,
  AsyncValidatorFn,
  FormGroupName,
  Validator,
  ValidatorFn,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
} from '@angular/forms';
import { RxapFormGroup } from '../form-group';

/**
 * A full exertion of FormGroupName from @angular/forms. The only change is the
 * ability to access the control container outside of the current component
 *
 * @deprecated use the ParentControlContainerDirective
 */
@Directive({
  selector: '[rxapFormGroupName]',
  providers: [
    {
      provide: ControlContainer,
      useExisting: forwardRef(() => FormGroupNameDirective),
    },
  ],
  // the base class declares the `name` input (alias formGroupName); re-alias it to rxapFormGroupName
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [ { name: 'name', alias: 'rxapFormGroupName' } ],
  exportAs: 'rxapFormGroup',
  standalone: true,
})
export class FormGroupNameDirective extends FormGroupName {

  public override get control(): RxapFormGroup {
    // TODO : add type check
    return this.formDirective!.getFormGroup(this) as any;
  }

  constructor() {
    const parent = inject(ControlContainer, { optional: true, skipSelf: true })!;
    const validators = [ ...(inject(NG_VALIDATORS, { optional: true, self: true }) ?? []) ] as Array<Validator | ValidatorFn>;
    const asyncValidators = [ ...(inject(NG_ASYNC_VALIDATORS, { optional: true, self: true }) ?? []) ] as Array<AsyncValidator | AsyncValidatorFn>;

    super(parent, validators, asyncValidators);
  }

}
