import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionLayoutControllerGetByIdResponse } from '../responses/dashboard-accordion-layout-controller-get-by-id.response';
import { DashboardAccordionLayoutControllerGetByIdParameter } from '../parameters/dashboard-accordion-layout-controller-get-by-id.parameter';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionLayoutController_getById')
export class DashboardAccordionLayoutControllerGetByIdDataSource extends OpenApiDataSource<DashboardAccordionLayoutControllerGetByIdResponse, DashboardAccordionLayoutControllerGetByIdParameter> {
}
