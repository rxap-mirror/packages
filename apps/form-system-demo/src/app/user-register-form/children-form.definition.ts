import {
  RxapFormDefinition,
  RxapForm,
  RxapFormTemplate,
  RxapFormControl,
  InputFormControl
} from '@rxap/form-system';
import { Injectable } from '@angular/core';

export interface ChildrenForm {
  firstname: string;
  lastname: string;
}

export const CHILDREN_FORM = 'children';

@RxapFormTemplate(`<column>
<control id="firstname"></control>
<control id="lastname"></control>
</column>`)
@RxapForm(CHILDREN_FORM)
@Injectable()
export class ChildrenFormDefinition extends RxapFormDefinition<ChildrenForm> {

  @RxapFormControl()
  public firstname!: InputFormControl<string>;

  @RxapFormControl()
  public lastname!: InputFormControl<string>;

}
