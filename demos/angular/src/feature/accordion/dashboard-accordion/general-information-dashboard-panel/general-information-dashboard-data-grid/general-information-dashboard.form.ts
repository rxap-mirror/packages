import { FormType, RxapFormGroup, RxapFormControl, UseFormControl, RxapValidators, RxapForm } from '@rxap/forms';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-dashboard-data-grid-controller-get.response';

@RxapForm('general-information-dashboard')
@Injectable()
export class GeneralInformationDashboardForm implements FormType<IGeneralInformationDashboardForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IGeneralInformationDashboardForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;
  @UseFormControl()
  public readonly location!: RxapFormControl<unknown>;
  @UseFormControl({
      validators: [RxapValidators.IsUrl()]
    })
  public readonly link!: RxapFormControl<string>;
  @UseFormControl()
  public readonly company!: RxapFormControl<string>;
  @UseFormControl()
  public readonly dashboardType!: RxapFormControl<number>;
}

export type IGeneralInformationDashboardForm = DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse;
