import {
  INJECTOR,
  Injector,
  Optional,
  Provider,
} from '@angular/core';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_INITIAL_STATE,
  RxapFormBuilder,
} from '@rxap/forms';
import {
  ComplexForm,
  IComplexForm,
} from './complex.form';
import { CompanyTypeOptionsDataSource } from './data-sources/company-type-options.data-source';

export const FormProviders: Provider[] = [CompanyTypeOptionsDataSource, ComplexForm];
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

export function FormFactory(injector: Injector, state: IComplexForm | null): ComplexForm {
  return new RxapFormBuilder<IComplexForm>(ComplexForm, injector).build(state ?? {});
}

function FormBuilderFactory(injector: Injector): RxapFormBuilder<IComplexForm> {
  return new RxapFormBuilder<IComplexForm>(ComplexForm, injector);
}
