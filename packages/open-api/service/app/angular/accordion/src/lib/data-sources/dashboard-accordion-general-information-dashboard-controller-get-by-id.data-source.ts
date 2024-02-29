import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-by-id.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationDashboardController_getById')
export class DashboardAccordionGeneralInformationDashboardControllerGetByIdDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse, DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter> {
}
