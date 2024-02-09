import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationDataGridController_get')
export class DashboardAccordionGeneralInformationDataGridControllerGetDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationDataGridControllerGetResponse, void> {
}
