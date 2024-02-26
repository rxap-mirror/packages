import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionReferenceControllerGetChildrenResponse } from '../responses/dashboard-accordion-reference-controller-get-children.response';
import { DashboardAccordionReferenceControllerGetChildrenParameter } from '../parameters/dashboard-accordion-reference-controller-get-children.parameter';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionReferenceController_getChildren')
export class DashboardAccordionReferenceControllerGetChildrenDataSource extends OpenApiDataSource<DashboardAccordionReferenceControllerGetChildrenResponse, DashboardAccordionReferenceControllerGetChildrenParameter> {
}
