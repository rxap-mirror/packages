import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject } from '@angular/core';
import { DashboardAccordionGeneralInformationDataGridControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-data-grid-controller-get.response';
import { DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-data-grid-controller-get.remote-method';
import { PanelAccordionDataSource, AccordionDataSource, ACCORDION_DATA_SOURCE } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('general-information-data-grid')
export class GeneralInformationDataGridDataSource extends PanelAccordionDataSource<DashboardAccordionGeneralInformationDataGridControllerGetResponse> {
  constructor(method: DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod, route: ActivatedRoute, @Inject(ACCORDION_DATA_SOURCE) accordionDataSource: AccordionDataSource) {
    super(method, route, accordionDataSource);
  }
}
