import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationDashboardController_get')
export class DashboardAccordionGeneralInformationDashboardControllerGetDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationDashboardControllerGetResponse, void> {
}
