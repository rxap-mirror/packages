import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, inject } from '@angular/core';
import { DashboardAccordionGeneralInformationDashboardControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-dashboard-controller-get.response';
import { DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-dashboard-controller-get.remote-method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('general-information-dashboard-data-grid')
export class GeneralInformationDashboardDataGridDataSource extends PanelAccordionDataSource<DashboardAccordionGeneralInformationDashboardControllerGetResponse> {
  protected override readonly method = inject(DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod);
}
