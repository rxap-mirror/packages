import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_getById',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationCloudDashboardController_getById",
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
              },
              "uuid": {
                "type": "string"
              }
            },
            "required": [
              "name",
              "company",
              "dashboardType",
              "uuid"
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
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse, DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void>): Promise<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse> {
    return super.call(parameters);
  }
}
