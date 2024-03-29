import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_resolveLocationControlValue',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationDashboardController_resolveLocationControlValue",
  "parameters": [
    {
      "name": "value",
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
              "uuid": {
                "type": "string"
              },
              "value": {
                "type": "string"
              },
              "display": {
                "type": "string"
              }
            },
            "required": [
              "name",
              "uuid",
              "value",
              "display"
            ]
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/general-information-dashboard/control/location/resolve/{value}"
}`
  })
export class DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse, DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void>): Promise<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse> {
    return super.call(parameters);
  }
}
