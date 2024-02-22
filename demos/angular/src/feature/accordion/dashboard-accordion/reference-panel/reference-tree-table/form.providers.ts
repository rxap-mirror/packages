import { Provider, INJECTOR, Injector, Optional } from '@angular/core';
import { ReferenceTreeTableFilterForm, IReferenceTreeTableFilterForm } from './reference-tree-table-filter.form';
import { RxapFormBuilder, RXAP_FORM_DEFINITION_BUILDER, RXAP_FORM_DEFINITION, RXAP_FORM_INITIAL_STATE } from '@rxap/forms';

export const FormProviders: Provider[] = [ReferenceTreeTableFilterForm];
export const FormComponentProviders: Provider[] = [{
    provide: RXAP_FORM_DEFINITION,
    useFactory: FormFactory,
    deps: [ INJECTOR,[ new Optional(), RXAP_FORM_INITIAL_STATE ] ]
  }];
export const FormBuilderProviders: Provider[] = [{
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: FormBuilderFactory,
    deps: [ INJECTOR ]
  }];

export function FormFactory(injector: Injector, state: IReferenceTreeTableFilterForm | null): ReferenceTreeTableFilterForm {
  return new RxapFormBuilder<IReferenceTreeTableFilterForm>(ReferenceTreeTableFilterForm, injector).build(state ?? {});
}

function FormBuilderFactory(injector: Injector): RxapFormBuilder<IReferenceTreeTableFilterForm> {
  return new RxapFormBuilder<IReferenceTreeTableFilterForm>(ReferenceTreeTableFilterForm, injector);
}
