import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject } from '@angular/core';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-special-data-grid-controller-get.response';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-special-data-grid-controller-get.remote-method';
import { PanelAccordionDataSource, AccordionDataSource, ACCORDION_DATA_SOURCE } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('general-information-special-data-grid')
export class GeneralInformationSpecialDataGridDataSource extends PanelAccordionDataSource<DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse> {
  constructor(method: DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod, route: ActivatedRoute, @Inject(ACCORDION_DATA_SOURCE) accordionDataSource: AccordionDataSource) {
    super(method, route, accordionDataSource);
  }
}
