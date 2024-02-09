import { Provider, INJECTOR, Injector, Optional } from '@angular/core';
import { GeneralInformationSpecialForm, IGeneralInformationSpecialForm } from './general-information-special.form';
import { RxapFormBuilder, RXAP_FORM_DEFINITION_BUILDER, RXAP_FORM_DEFINITION, RXAP_FORM_INITIAL_STATE, RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD, RXAP_FORM_SUBMIT_METHOD, RXAP_FORM_CONTEXT } from '@rxap/forms';
import { DataSourceRefreshToMethodAdapterFactory } from '@rxap/data-source';
import { GeneralInformationSpecialDataGridDataSource } from './general-information-special-data-grid.data-source';
import { SubmitContextFormAdapterFactory, FormContextFromActivatedRouteFactory } from '@rxap/form-system';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-special-data-grid-controller-submit.remote-method';
import { ActivatedRoute } from '@angular/router';

export const FormProviders: Provider[] = [GeneralInformationSpecialForm, {
    provide: RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
    useFactory: DataSourceRefreshToMethodAdapterFactory,
    deps: [ GeneralInformationSpecialDataGridDataSource ]
  }, {
    provide: RXAP_FORM_SUBMIT_METHOD,
    useFactory: SubmitContextFormAdapterFactory,
    deps: [ DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod,[ new Optional(), RXAP_FORM_CONTEXT ] ]
  }];
export const FormComponentProviders: Provider[] = [{
    provide: RXAP_FORM_DEFINITION,
    useFactory: FormFactory,
    deps: [ INJECTOR,[ new Optional(), RXAP_FORM_INITIAL_STATE ] ]
  },
  {
    provide: RXAP_FORM_CONTEXT,
    useFactory: FormContextFromActivatedRouteFactory,
    deps: [ ActivatedRoute ]
  },
];
export const FormBuilderProviders: Provider[] = [{
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: FormBuilderFactory,
    deps: [ INJECTOR ]
  }];

export function FormFactory(injector: Injector, state: IGeneralInformationSpecialForm | null): GeneralInformationSpecialForm {
  return new RxapFormBuilder<IGeneralInformationSpecialForm>(GeneralInformationSpecialForm, injector).build(state ?? {});
}

function FormBuilderFactory(injector: Injector): RxapFormBuilder<IGeneralInformationSpecialForm> {
  return new RxapFormBuilder<IGeneralInformationSpecialForm>(GeneralInformationSpecialForm, injector);
}
