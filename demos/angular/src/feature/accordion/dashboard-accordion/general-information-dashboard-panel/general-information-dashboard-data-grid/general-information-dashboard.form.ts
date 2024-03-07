import { Injectable } from '@angular/core';
import {
  FormType,
  RxapForm,
  RxapFormControl,
  RxapFormGroup,
  RxapValidators,
  UseFormControl,
} from '@rxap/forms';
import {
  UseTableSelectColumns,
  UseTableSelectDataSource,
  UseTableSelectMethod,
  UseTableSelectToDisplay,
  UseTableSelectToValue,
} from '@rxap/ngx-material-table-select';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody } from 'open-api-service-app-angular-accordion/request-bodies/dashboard-accordion-general-information-dashboard-controller-submit-by-id.request-body';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-dashboard-controller-get-by-id.response';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.response';
import { LocationSelectTableDataSource } from './data-sources/location-select-table.data-source';
import { LocationTableSelectValueResolverMethod } from './methods/location-table-select-value-resolver.method';

@RxapForm('general-information-dashboard')
@Injectable()
export class GeneralInformationDashboardForm implements FormType<IGeneralInformationDashboardForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IGeneralInformationDashboardForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;

  @UseTableSelectDataSource(LocationSelectTableDataSource)
  @UseTableSelectToDisplay<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse['rows'][number]>(item => item.name)
  @UseTableSelectToValue<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse['rows'][number]>(item => item.uuid)
  @UseTableSelectColumns({
        name: {
          label: $localize`Name`,
          filter: true,
          type: 'default'
        }
      })
  @UseTableSelectMethod(LocationTableSelectValueResolverMethod)
  @UseFormControl()
  public readonly location!: RxapFormControl<string>;
  @UseFormControl({
      validators: [RxapValidators.IsUrl()]
    })
  public readonly link!: RxapFormControl<string>;
}

export type IGeneralInformationDashboardForm = Partial<Omit<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse, 'company' | 'dashboardType' | 'uuid'>> & DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody;
