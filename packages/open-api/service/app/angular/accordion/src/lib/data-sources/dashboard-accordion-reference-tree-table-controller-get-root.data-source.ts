import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionReferenceTreeTableControllerGetRootResponse } from '../responses/dashboard-accordion-reference-tree-table-controller-get-root.response';
import { DashboardAccordionReferenceTreeTableControllerGetRootParameter } from '../parameters/dashboard-accordion-reference-tree-table-controller-get-root.parameter';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionReferenceTreeTableController_getRoot')
export class DashboardAccordionReferenceTreeTableControllerGetRootDataSource extends OpenApiDataSource<DashboardAccordionReferenceTreeTableControllerGetRootResponse, DashboardAccordionReferenceTreeTableControllerGetRootParameter> {
}
