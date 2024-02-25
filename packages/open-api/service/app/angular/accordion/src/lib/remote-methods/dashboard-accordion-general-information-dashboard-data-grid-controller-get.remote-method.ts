import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-dashboard-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardDataGridController_get',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationDashboardDataGridController_get",
  "parameters": [],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "location": {
                "type": "unknown"
              },
              "name": {
                "type": "string"
              },
              "link": {
                "type": "string"
              },
              "company": {
                "type": "string"
              },
              "dashboardType": {
                "type": "number"
              }
            },
            "required": [
              "location",
              "name",
              "link",
              "company",
              "dashboardType"
            ]
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/general-information-dashboard-data-grid"
}`
  })
export class DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse, void, void> {
  public override call(): Promise<DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse> {
    return super.call();
  }
}
