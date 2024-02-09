import { FormType, RxapFormGroup, RxapFormControl, UseFormControl, RxapValidators, RxapForm } from '@rxap/forms';
import { Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-special-data-grid-controller-get.response';

@RxapForm('general-information-special')
@Injectable()
export class GeneralInformationSpecialForm implements FormType<IGeneralInformationSpecialForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IGeneralInformationSpecialForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<number>;
}

export type IGeneralInformationSpecialForm = DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse;
