import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, Inject } from '@angular/core';
import { DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-normal-data-grid-controller-get.response';
import { DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-normal-data-grid-controller-get.remote-method';
import { PanelAccordionDataSource, AccordionDataSource, ACCORDION_DATA_SOURCE } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('general-information-normal-data-grid')
export class GeneralInformationNormalDataGridDataSource extends PanelAccordionDataSource<DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse> {
  constructor(method: DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod, route: ActivatedRoute, @Inject(ACCORDION_DATA_SOURCE) accordionDataSource: AccordionDataSource) {
    super(method, route, accordionDataSource);
  }
}
