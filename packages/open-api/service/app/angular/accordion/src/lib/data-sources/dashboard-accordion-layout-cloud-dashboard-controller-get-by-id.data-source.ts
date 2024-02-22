import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.response';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.parameter';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionLayoutCloudDashboardController_getById')
export class DashboardAccordionLayoutCloudDashboardControllerGetByIdDataSource extends OpenApiDataSource<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse, DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter> {
}
