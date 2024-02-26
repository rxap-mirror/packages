import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, inject } from '@angular/core';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-cloud-dashboard-controller-get.response';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-cloud-dashboard-controller-get.remote-method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('general-information-cloud-dashboard-data-grid')
export class GeneralInformationCloudDashboardDataGridDataSource extends PanelAccordionDataSource<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse> {
  protected override readonly method = inject(DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod);
}
