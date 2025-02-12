import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-options.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationDashboardController_getLocationControlOptions')
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse, void> {
}
