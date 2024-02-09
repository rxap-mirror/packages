import { RxapOpenApiDataSource, OpenApiDataSource } from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-normal-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionGeneralInformationNormalDataGridController_get')
export class DashboardAccordionGeneralInformationNormalDataGridControllerGetDataSource extends OpenApiDataSource<DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse, void> {
}
