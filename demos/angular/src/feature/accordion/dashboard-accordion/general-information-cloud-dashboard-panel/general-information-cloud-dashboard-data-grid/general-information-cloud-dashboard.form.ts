import { FormType, RxapFormGroup, RxapFormControl, UseFormControl, RxapForm } from '@rxap/forms';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-get.response';

@RxapForm('general-information-cloud-dashboard')
@Injectable()
export class GeneralInformationCloudDashboardForm implements FormType<IGeneralInformationCloudDashboardForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IGeneralInformationCloudDashboardForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;
  @UseFormControl()
  public readonly company!: RxapFormControl<string>;
  @UseFormControl()
  public readonly dashboardType!: RxapFormControl<number>;
}

export type IGeneralInformationCloudDashboardForm = DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse;
