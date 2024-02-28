import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { DashboardAccordionGeneralInformationDashboardControllerGetParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationDashboardController_get')
export class DashboardAccordionGeneralInformationDashboardControllerGetDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationDashboardControllerGetResponse, DashboardAccordionGeneralInformationDashboardControllerGetParameter> {
}
