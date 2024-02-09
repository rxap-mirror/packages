import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-special-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationSpecialDataGridController_get')
export class DashboardAccordionGeneralInformationSpecialDataGridControllerGetDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse, void> {
}
