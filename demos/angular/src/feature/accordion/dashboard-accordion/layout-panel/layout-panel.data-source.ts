import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject } from '@angular/core';
import { DashboardAccordionLayoutControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-layout-controller-get-by-id.response';
import { DashboardAccordionLayoutControllerGetByIdRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-layout-controller-get-by-id.remote-method';
import { PanelAccordionDataSource, AccordionDataSource, ACCORDION_DATA_SOURCE } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('layout-panel')
export class LayoutPanelDataSource extends PanelAccordionDataSource<DashboardAccordionLayoutControllerGetByIdResponse> {
  constructor(method: DashboardAccordionLayoutControllerGetByIdRemoteMethod, route: ActivatedRoute, @Inject(ACCORDION_DATA_SOURCE) accordionDataSource: AccordionDataSource) {
    super(method, route, accordionDataSource);
  }
}
