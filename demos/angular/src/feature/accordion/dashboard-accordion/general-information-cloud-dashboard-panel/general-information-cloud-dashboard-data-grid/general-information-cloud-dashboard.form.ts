import { Injectable } from '@angular/core';
import {
  FormType,
  RxapForm,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
} from '@rxap/forms';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.response';

@RxapForm('general-information-cloud-dashboard')
@Injectable()
export class GeneralInformationCloudDashboardForm implements FormType<IGeneralInformationCloudDashboardForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IGeneralInformationCloudDashboardForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;
}

export type IGeneralInformationCloudDashboardForm = Omit<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse, 'company' | 'dashboardType' | 'uuid'>;
