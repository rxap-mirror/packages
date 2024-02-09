import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, OpenApiRemoteMethodParameter, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionLayoutControllerGetByIdParameter } from '../parameters/dashboard-accordion-layout-controller-get-by-id.parameter';
import { DashboardAccordionLayoutControllerGetByIdResponse } from '../responses/dashboard-accordion-layout-controller-get-by-id.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionLayoutController_getById',
    operation: `{
  "operationId": "DashboardAccordionLayoutController_getById",
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
            "properties": {}
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/layout"
}`
  })
export class DashboardAccordionLayoutControllerGetByIdRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionLayoutControllerGetByIdResponse, DashboardAccordionLayoutControllerGetByIdParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionLayoutControllerGetByIdParameter, void>): Promise<DashboardAccordionLayoutControllerGetByIdResponse> {
    return super.call(parameters);
  }
}
