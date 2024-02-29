import {
  inject,
  Injectable,
} from '@angular/core';
import { RxapDataSource } from '@rxap/data-source';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.response';

@Injectable()
@RxapDataSource('general-information-cloud-dashboard-data-grid')
export class GeneralInformationCloudDashboardDataGridDataSource extends PanelAccordionDataSource<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse> {
  protected override readonly method = inject(DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod);
}
