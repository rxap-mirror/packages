import { RxapDataSource } from '@rxap/data-source';
import { DynamicTableDataSource } from '@rxap/data-source/table';
import { Injectable, Inject } from '@angular/core';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.remote-method';
import { GetPageAdapterRemoteMethod } from '@rxap/open-api/remote-method';

@Injectable()
@RxapDataSource('location-select-table')
export class LocationSelectTableDataSource extends DynamicTableDataSource {
  constructor(@Inject(DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod) getByFilter: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod) {
    super(new GetPageAdapterRemoteMethod(getByFilter as any));
  }
}
