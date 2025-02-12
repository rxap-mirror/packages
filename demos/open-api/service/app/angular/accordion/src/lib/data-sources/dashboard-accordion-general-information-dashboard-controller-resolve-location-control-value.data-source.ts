import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationDashboardController_resolveLocationControlValue')
export class DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse, DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter> {
}
