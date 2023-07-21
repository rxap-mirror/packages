import {
  INJECTOR,
  Injector,
  Optional,
  Provider,
} from '@angular/core';
import {
  ITableHeaderButtonForm,
  TableHeaderButtonForm,
} from './table-header-button.form';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_INITIAL_STATE,
  RxapFormBuilder,
} from '@rxap/forms';

export const FormProviders: Provider[] = [ TableHeaderButtonForm ];
export const FormComponentProviders: Provider[] = [
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: FormFactory,
    deps: [ INJECTOR, [ new Optional(), RXAP_FORM_INITIAL_STATE ] ],
  },
];
export const FormBuilderProviders: Provider[] = [
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: FormBuilderFactory,
    deps: [ INJECTOR ],
  },
];

export function FormFactory(injector: Injector, state: ITableHeaderButtonForm | null): TableHeaderButtonForm {
  return new RxapFormBuilder<ITableHeaderButtonForm>(TableHeaderButtonForm, injector).build(state ?? {});
}

function FormBuilderFactory(injector: Injector): RxapFormBuilder<ITableHeaderButtonForm> {
  return new RxapFormBuilder<ITableHeaderButtonForm>(TableHeaderButtonForm, injector);
}
