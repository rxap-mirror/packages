import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-dashboard-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationDashboardDataGridController_get')
export class DashboardAccordionGeneralInformationDashboardDataGridControllerGetDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse, void> {
}
