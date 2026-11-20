import { Directive, forwardRef, input, inject } from '@angular/core';
import {
  ControlContainer,
  FormGroupName,
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
  exportAs: 'rxapFormGroup',
  standalone: true,
})
export class FormGroupNameDirective extends FormGroupName {

  public override readonly name = input.required<string | number | null>({ alias: "rxapFormGroupName" });

  public override get control(): RxapFormGroup {
    // TODO : add type check
    return this.formDirective!.getFormGroup(this) as any;
  }

  constructor() {
    const parent = inject(ControlContainer, { optional: true, skipSelf: true });
    const validators = inject(NG_VALIDATORS, { optional: true, self: true });
    const asyncValidators = inject(NG_ASYNC_VALIDATORS, { optional: true, self: true });

    super(parent, validators, asyncValidators);
  }

}
