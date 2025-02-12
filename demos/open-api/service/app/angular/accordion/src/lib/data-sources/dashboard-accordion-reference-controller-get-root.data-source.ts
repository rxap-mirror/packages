import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionReferenceControllerGetRootResponse } from '../responses/dashboard-accordion-reference-controller-get-root.response';
import { DashboardAccordionReferenceControllerGetRootParameter } from '../parameters/dashboard-accordion-reference-controller-get-root.parameter';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionReferenceController_getRoot')
export class DashboardAccordionReferenceControllerGetRootDataSource extends OpenApiDataSource<DashboardAccordionReferenceControllerGetRootResponse, DashboardAccordionReferenceControllerGetRootParameter> {
}
