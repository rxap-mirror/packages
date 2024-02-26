import { FormType, RxapFormGroup, RxapFormControl, UseFormControl, RxapForm } from '@rxap/forms';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-cloud-dashboard-controller-get.response';

@RxapForm('general-information-cloud-dashboard')
@Injectable()
export class GeneralInformationCloudDashboardForm implements FormType<IGeneralInformationCloudDashboardForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IGeneralInformationCloudDashboardForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;
}

export type IGeneralInformationCloudDashboardForm = Omit<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse, 'company' | 'dashboardType'>;
