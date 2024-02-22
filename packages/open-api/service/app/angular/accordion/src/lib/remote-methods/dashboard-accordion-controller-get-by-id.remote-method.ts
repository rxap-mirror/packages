import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, OpenApiRemoteMethodParameter, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionControllerGetByIdParameter } from '../parameters/dashboard-accordion-controller-get-by-id.parameter';
import { DashboardAccordionControllerGetByIdResponse } from '../responses/dashboard-accordion-controller-get-by-id.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionController_getById',
    operation: `{
  "operationId": "DashboardAccordionController_getById",
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
              "uuid": {
                "type": "string"
              },
              "dashboardType": {
                "type": "number"
              },
              "name": {
                "type": "string"
              }
            },
            "required": [
              "uuid",
              "dashboardType",
              "name"
            ]
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}"
}`
  })
export class DashboardAccordionControllerGetByIdRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionControllerGetByIdResponse, DashboardAccordionControllerGetByIdParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionControllerGetByIdParameter, void>): Promise<DashboardAccordionControllerGetByIdResponse> {
    return super.call(parameters);
  }
}
