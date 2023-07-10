import {
  Directive,
  forwardRef,
  Inject,
  Input,
  Optional,
  Self,
  SkipSelf,
} from '@angular/core';
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

  @Input('rxapFormGroupName')
  public override name!: string | number | null;

  public override get control(): RxapFormGroup {
    // TODO : add type check
    return this.formDirective!.getFormGroup(this) as any;
  }

  constructor(
    @Optional() @SkipSelf() parent: ControlContainer,
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: any[],
    @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: any[],
  ) {
    super(parent, validators, asyncValidators);
  }

}
