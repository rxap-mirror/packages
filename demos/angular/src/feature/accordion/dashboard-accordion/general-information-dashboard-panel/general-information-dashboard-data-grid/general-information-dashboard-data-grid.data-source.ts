import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, inject } from '@angular/core';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-dashboard-data-grid-controller-get.response';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-dashboard-data-grid-controller-get.remote-method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('general-information-dashboard-data-grid')
export class GeneralInformationDashboardDataGridDataSource extends PanelAccordionDataSource<DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse> {
  protected override readonly method = inject(DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod);
}
