import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardDataGridController_get',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationCloudDashboardDataGridController_get",
  "parameters": [],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "name": {
                "type": "unknown"
              },
              "company": {
                "type": "string"
              },
              "dashboardType": {
                "type": "number"
              }
            },
            "required": [
              "name",
              "company",
              "dashboardType"
            ]
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/general-information-cloud-dashboard-data-grid"
}`
  })
export class DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse, void, void> {
  public override call(): Promise<DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse> {
    return super.call();
  }
}
