import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationCloudDashboardDataGridController_get')
export class DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse, void> {
}
