import {
  INJECTOR,
  Injector,
  Optional,
  Provider,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataSourceRefreshToMethodAdapterFactory } from '@rxap/data-source';
import {
  FormContextFromActivatedRouteFactory,
  SubmitContextFormAdapterFactory,
} from '@rxap/form-system';
import {
  RXAP_FORM_CONTEXT,
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_INITIAL_STATE,
  RXAP_FORM_SUBMIT_METHOD,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
  RxapFormBuilder,
} from '@rxap/forms';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.remote-method';
import { GeneralInformationCloudDashboardDataGridDataSource } from './general-information-cloud-dashboard-data-grid.data-source';
import {
  GeneralInformationCloudDashboardForm,
  IGeneralInformationCloudDashboardForm,
} from './general-information-cloud-dashboard.form';

export const FormProviders: Provider[] = [GeneralInformationCloudDashboardForm, {
    provide: RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
    useFactory: DataSourceRefreshToMethodAdapterFactory,
    deps: [ GeneralInformationCloudDashboardDataGridDataSource ]
  }, {
    provide: RXAP_FORM_SUBMIT_METHOD,
    useFactory: SubmitContextFormAdapterFactory,
    deps: [ DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod,[ new Optional(), RXAP_FORM_CONTEXT ] ]
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
