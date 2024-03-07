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
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-dashboard-controller-submit-by-id.remote-method';
import { LocationSelectTableDataSource } from './data-sources/location-select-table.data-source';
import { GeneralInformationDashboardDataGridDataSource } from './general-information-dashboard-data-grid.data-source';
import {
  GeneralInformationDashboardForm,
  IGeneralInformationDashboardForm,
} from './general-information-dashboard.form';
import { LocationTableSelectValueResolverMethod } from './methods/location-table-select-value-resolver.method';

export const FormProviders: Provider[] = [LocationSelectTableDataSource, LocationTableSelectValueResolverMethod, GeneralInformationDashboardForm, {
    provide: RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
    useFactory: DataSourceRefreshToMethodAdapterFactory,
    deps: [ GeneralInformationDashboardDataGridDataSource ]
  }, {
    provide: RXAP_FORM_SUBMIT_METHOD,
    useFactory: SubmitContextFormAdapterFactory,
    deps: [ DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod,[ new Optional(), RXAP_FORM_CONTEXT ] ]
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

export function FormFactory(injector: Injector, state: IGeneralInformationDashboardForm | null): GeneralInformationDashboardForm {
  return new RxapFormBuilder<IGeneralInformationDashboardForm>(GeneralInformationDashboardForm, injector).build(state ?? {});
}

function FormBuilderFactory(injector: Injector): RxapFormBuilder<IGeneralInformationDashboardForm> {
  return new RxapFormBuilder<IGeneralInformationDashboardForm>(GeneralInformationDashboardForm, injector);
}
