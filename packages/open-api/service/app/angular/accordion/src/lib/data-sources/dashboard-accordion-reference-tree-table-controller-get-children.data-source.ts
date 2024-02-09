import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionReferenceTreeTableControllerGetChildrenResponse } from '../responses/dashboard-accordion-reference-tree-table-controller-get-children.response';
import { DashboardAccordionReferenceTreeTableControllerGetChildrenParameter } from '../parameters/dashboard-accordion-reference-tree-table-controller-get-children.parameter';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionReferenceTreeTableController_getChildren')
export class DashboardAccordionReferenceTreeTableControllerGetChildrenDataSource extends OpenApiDataSource<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse, DashboardAccordionReferenceTreeTableControllerGetChildrenParameter> {
}
