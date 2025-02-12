import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.response';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.parameter';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationDashboardController_getLocationControlTableSelectPage')
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse, DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter> {
}
