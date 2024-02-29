import {
  inject,
  Injectable,
} from '@angular/core';
import { RxapDataSource } from '@rxap/data-source';
import { PanelAccordionDataSource } from '@rxap/data-source/accordion';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-dashboard-controller-get-by-id.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-general-information-dashboard-controller-get-by-id.response';

@Injectable()
@RxapDataSource('general-information-dashboard-data-grid')
export class GeneralInformationDashboardDataGridDataSource extends PanelAccordionDataSource<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse> {
  protected override readonly method = inject(DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod);
}
