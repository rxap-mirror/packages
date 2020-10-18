import {
  Directive,
  Inject,
  SkipSelf,
  Optional,
  Self,
  Input,
  forwardRef
} from '@angular/core';
import {
  FormGroupName,
  NG_ASYNC_VALIDATORS,
  ControlContainer,
  NG_VALIDATORS
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
      useExisting: forwardRef(() => FormGroupNameDirective)
    }
  ],
  exportAs: 'rxapFormGroup'
})
export class FormGroupNameDirective extends FormGroupName {

  @Input('rxapFormGroupName')
  public name!: string|number|null;

  public get control(): RxapFormGroup {
    // TODO : add type check
    return this.formDirective!.getFormGroup(this) as any;
  }

  constructor(
    @Optional() @SkipSelf() parent: ControlContainer,
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: any[],
    @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: any[]) {
    super(parent, validators, asyncValidators);
  }

}
