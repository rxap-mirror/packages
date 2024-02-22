import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, inject } from '@angular/core';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-get.response';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-get.remote-method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('general-information-cloud-dashboard-data-grid')
export class GeneralInformationCloudDashboardDataGridDataSource extends PanelAccordionDataSource<DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse> {
  protected override readonly method = inject(DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod);
}
