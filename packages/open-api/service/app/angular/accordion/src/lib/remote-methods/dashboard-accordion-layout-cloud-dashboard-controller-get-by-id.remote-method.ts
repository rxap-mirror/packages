import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionLayoutCloudDashboardController_getById',
    operation: `{
  "operationId": "DashboardAccordionLayoutCloudDashboardController_getById",
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
              "layoutList": {
                "type": "unknown"
              },
              "uuid": {
                "type": "string"
              }
            },
            "required": [
              "layoutList",
              "uuid"
            ]
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/layout-cloud-dashboard"
}`
  })
export class DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse, DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void>): Promise<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse> {
    return super.call(parameters);
  }
}
