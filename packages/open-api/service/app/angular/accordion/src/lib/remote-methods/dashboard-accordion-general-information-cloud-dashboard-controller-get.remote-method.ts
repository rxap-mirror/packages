import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-get.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_get',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationCloudDashboardController_get",
  "parameters": [
    {
      "name": "uuid",
      "required": true,
      "in": "path",
      "schema": {
        "type": "string"
      }
    }
  ],
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
  "path": "/dashboard-accordion/{uuid}/general-information-cloud-dashboard"
}`
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse, DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter, void>): Promise<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse> {
    return super.call(parameters);
  }
}
