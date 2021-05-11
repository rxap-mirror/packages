import {
  FormDefinition,
  RxapFormGroup,
  RxapForm,
  RxapFormControl,
  UseFormControl,
  RxapFormBuilder,
  RXAP_FORM_DEFINITION
} from '@rxap/forms';
import {
  Provider,
  Injector
} from '@angular/core';

@RxapForm('has-auth')
export class HasAuthorizationDirectiveForm implements FormDefinition {

  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public input!: RxapFormControl;

  @UseFormControl()
  public select!: RxapFormControl;

  @UseFormControl()
  public checkbox!: RxapFormControl;

  @UseFormControl()
  public slideToggle!: RxapFormControl;

}

export function HasAuthorizationDirectiveFormFactory() {
  return new RxapFormBuilder(HasAuthorizationDirectiveForm, Injector.NULL).build();
}

export const HasAuthorizationDirectiveFormParameters: Provider[] = [
  HasAuthorizationDirectiveForm,
  {
    provide:    RXAP_FORM_DEFINITION,
    useFactory: HasAuthorizationDirectiveFormFactory,
    deps:       []
  }
];
