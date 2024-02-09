import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-controller-get-by-id.response';
import { DashboardAccordionControllerGetByIdRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-controller-get-by-id.remote-method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('dashboard-accordion')
export class DashboardAccordionDataSource extends AccordionDataSource<DashboardAccordionControllerGetByIdResponse> {
  constructor(method: DashboardAccordionControllerGetByIdRemoteMethod, route: ActivatedRoute) {
    super(method, route);
  }
}
