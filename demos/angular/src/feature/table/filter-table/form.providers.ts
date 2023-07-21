import {
  INJECTOR,
  Injector,
  Optional,
  Provider,
} from '@angular/core';
import {
  FilterTableFilterForm,
  IFilterTableFilterForm,
} from './filter-table-filter.form';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_INITIAL_STATE,
  RxapFormBuilder,
} from '@rxap/forms';

export const FormProviders: Provider[] = [ FilterTableFilterForm ];
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

export function FormFactory(injector: Injector, state: IFilterTableFilterForm | null): FilterTableFilterForm {
  return new RxapFormBuilder<IFilterTableFilterForm>(FilterTableFilterForm, injector).build(state ?? {});
}

function FormBuilderFactory(injector: Injector): RxapFormBuilder<IFilterTableFilterForm> {
  return new RxapFormBuilder<IFilterTableFilterForm>(FilterTableFilterForm, injector);
}
