import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationCloudDashboardController_getById')
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse, DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter> {
}
