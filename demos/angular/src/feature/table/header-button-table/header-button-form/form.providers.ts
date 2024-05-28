import { Provider, INJECTOR, Injector, Optional } from '@angular/core';
import { HeaderButtonForm, IHeaderButtonForm } from './header-button.form';
import {
  RxapFormBuilder,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_DEFINITION,
  RXAP_FORM_INITIAL_STATE,
} from '@rxap/forms';

export const FormProviders: Provider[] = [HeaderButtonForm];
export const FormComponentProviders: Provider[] = [
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: FormFactory,
    deps: [INJECTOR, [new Optional(), RXAP_FORM_INITIAL_STATE]],
  },
];
export const FormBuilderProviders: Provider[] = [
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: FormBuilderFactory,
    deps: [INJECTOR],
  },
];

export function FormFactory(
  injector: Injector,
  state: IHeaderButtonForm | null
): HeaderButtonForm {
  return new RxapFormBuilder<IHeaderButtonForm>(
    HeaderButtonForm,
    injector
  ).build(state ?? {});
}

function FormBuilderFactory(
  injector: Injector
): RxapFormBuilder<IHeaderButtonForm> {
  return new RxapFormBuilder<IHeaderButtonForm>(HeaderButtonForm, injector);
}
