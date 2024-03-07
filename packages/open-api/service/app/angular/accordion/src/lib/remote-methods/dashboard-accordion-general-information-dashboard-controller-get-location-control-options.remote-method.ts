import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-options.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_getLocationControlOptions',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationDashboardController_getLocationControlOptions",
  "parameters": [],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
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
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/general-information-dashboard/control/location/options"
}`
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse, void, void> {
  public override call(): Promise<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse> {
    return super.call();
  }
}
