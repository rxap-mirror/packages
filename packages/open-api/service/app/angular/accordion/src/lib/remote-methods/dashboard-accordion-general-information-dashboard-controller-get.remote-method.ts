import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_get',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationDashboardController_get",
  "parameters": [],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "location": {
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
              "name",
              "location",
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
  "path": "/dashboard-accordion/{uuid}/general-information-dashboard"
}`
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationDashboardControllerGetResponse, void, void> {
  public override call(): Promise<DashboardAccordionGeneralInformationDashboardControllerGetResponse> {
    return super.call();
  }
}
