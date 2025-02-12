import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse } from '../responses/dashboard-accordion-reference-controller-get-scope-type-options.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiDataSource('DashboardAccordionReferenceController_getScopeTypeOptions')
export class DashboardAccordionReferenceControllerGetScopeTypeOptionsDataSource extends OpenApiDataSource<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse, void> {
}
