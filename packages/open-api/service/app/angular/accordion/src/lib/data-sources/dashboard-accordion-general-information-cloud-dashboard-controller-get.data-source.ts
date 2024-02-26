import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationCloudDashboardController_get')
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse, void> {
}
