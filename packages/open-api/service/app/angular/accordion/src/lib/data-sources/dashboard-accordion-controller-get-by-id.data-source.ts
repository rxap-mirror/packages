import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionControllerGetByIdResponse } from '../responses/dashboard-accordion-controller-get-by-id.response';
import { DashboardAccordionControllerGetByIdParameter } from '../parameters/dashboard-accordion-controller-get-by-id.parameter';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionController_getById')
export class DashboardAccordionControllerGetByIdDataSource extends OpenApiDataSource<DashboardAccordionControllerGetByIdResponse, DashboardAccordionControllerGetByIdParameter> {
}
