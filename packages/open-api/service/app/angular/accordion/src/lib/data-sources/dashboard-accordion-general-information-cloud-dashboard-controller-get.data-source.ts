import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-get.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationCloudDashboardController_get')
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse, DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter> {
}
