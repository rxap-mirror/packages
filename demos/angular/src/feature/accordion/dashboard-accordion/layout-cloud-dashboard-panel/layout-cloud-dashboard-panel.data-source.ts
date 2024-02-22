import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable, inject } from '@angular/core';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.response';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.remote-method';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';

@Injectable()
@RxapDataSource('layout-cloud-dashboard-panel')
export class LayoutCloudDashboardPanelDataSource extends PanelAccordionDataSource<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse> {
  protected override readonly method = inject(DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod);
}
