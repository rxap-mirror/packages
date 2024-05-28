import { Provider, INJECTOR, Injector, Optional } from '@angular/core';
import { MaximumTreeForm, IMaximumTreeForm } from './maximum-tree.form';
import {
  RxapFormBuilder,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_DEFINITION,
  RXAP_FORM_INITIAL_STATE,
} from '@rxap/forms';

export const FormProviders: Provider[] = [MaximumTreeForm];
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
  state: IMaximumTreeForm | null
): MaximumTreeForm {
  return new RxapFormBuilder<IMaximumTreeForm>(MaximumTreeForm, injector).build(
    state ?? {}
  );
}

function FormBuilderFactory(
  injector: Injector
): RxapFormBuilder<IMaximumTreeForm> {
  return new RxapFormBuilder<IMaximumTreeForm>(MaximumTreeForm, injector);
}
