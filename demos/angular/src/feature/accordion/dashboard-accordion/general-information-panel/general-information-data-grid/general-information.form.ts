import { FormType, RxapFormGroup, RxapFormControl, UseFormControl, RxapValidators, RxapForm } from '@rxap/forms';
import { Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationDataGridDtoResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-data-grid-dto.response';

@RxapForm('general-information')
@Injectable()
export class GeneralInformationForm implements FormType<IGeneralInformationForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IGeneralInformationForm>;
}

export type IGeneralInformationForm = DashboardAccordionGeneralInformationDataGridDtoResponse;
