import { Provider, INJECTOR, Injector, Optional } from '@angular/core';
import { GeneralInformationCloudDashboardForm, IGeneralInformationCloudDashboardForm } from './general-information-cloud-dashboard.form';
import { RxapFormBuilder, RXAP_FORM_DEFINITION_BUILDER, RXAP_FORM_DEFINITION, RXAP_FORM_INITIAL_STATE, RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD, RXAP_FORM_SUBMIT_METHOD, RXAP_FORM_CONTEXT } from '@rxap/forms';
import { DataSourceRefreshToMethodAdapterFactory } from '@rxap/data-source';
import { GeneralInformationCloudDashboardDataGridDataSource } from './general-information-cloud-dashboard-data-grid.data-source';
import { SubmitContextFormAdapterFactory, FormContextFromActivatedRouteFactory } from '@rxap/form-system';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-submit.remote-method';
import { ActivatedRoute } from '@angular/router';

export const FormProviders: Provider[] = [GeneralInformationCloudDashboardForm, {
    provide: RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
    useFactory: DataSourceRefreshToMethodAdapterFactory,
    deps: [ GeneralInformationCloudDashboardDataGridDataSource ]
  }, {
    provide: RXAP_FORM_SUBMIT_METHOD,
    useFactory: SubmitContextFormAdapterFactory,
    deps: [ DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod,[ new Optional(), RXAP_FORM_CONTEXT ] ]
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

export function FormFactory(injector: Injector, state: IGeneralInformationCloudDashboardForm | null): GeneralInformationCloudDashboardForm {
  return new RxapFormBuilder<IGeneralInformationCloudDashboardForm>(GeneralInformationCloudDashboardForm, injector).build(state ?? {});
}

function FormBuilderFactory(injector: Injector): RxapFormBuilder<IGeneralInformationCloudDashboardForm> {
  return new RxapFormBuilder<IGeneralInformationCloudDashboardForm>(GeneralInformationCloudDashboardForm, injector);
}
