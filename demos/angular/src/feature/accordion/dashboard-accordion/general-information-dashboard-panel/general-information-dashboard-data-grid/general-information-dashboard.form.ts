import { FormType, RxapFormGroup, RxapFormControl, UseFormControl, RxapValidators, RxapForm } from '@rxap/forms';
import { Injectable } from '@angular/core';
import {
  UseTableSelectColumns,
  UseTableSelectDataSource,
  UseTableSelectToDisplay,
  UseTableSelectToValue,
} from '@rxap/ngx-material-table-select';
import { LocationSelectTableDataSource } from './data-sources/location-select-table.data-source';
import { DashboardAccordionGeneralInformationDashboardControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-dashboard-controller-get.response';

@RxapForm('general-information-dashboard')
@Injectable()
export class GeneralInformationDashboardForm implements FormType<IGeneralInformationDashboardForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IGeneralInformationDashboardForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;

  @UseTableSelectDataSource(LocationSelectTableDataSource)
  @UseTableSelectToDisplay(item => item['name'])
  @UseTableSelectToValue(item => item['uuid'])
  @UseTableSelectColumns({
        name: {
          label: $localize`Name`,
          filter: true,
          type: 'default'
        }
      })
  @UseFormControl()
  public readonly location!: RxapFormControl<string>;
  @UseFormControl({
      validators: [RxapValidators.IsUrl()]
    })
  public readonly link!: RxapFormControl<string>;
}

export type IGeneralInformationDashboardForm = Omit<DashboardAccordionGeneralInformationDashboardControllerGetResponse, 'company' | 'dashboardType'>;
