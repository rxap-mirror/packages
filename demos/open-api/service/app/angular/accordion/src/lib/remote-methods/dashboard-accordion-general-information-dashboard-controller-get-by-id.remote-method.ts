import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-by-id.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_getById',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationDashboardController_getById",
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
              },
              "uuid": {
                "type": "string"
              }
            },
            "required": [
              "name",
              "location",
              "link",
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
  "path": "/dashboard-accordion/{uuid}/general-information-dashboard"
}`
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse, DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void>): Promise<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse> {
    return super.call(parameters);
  }
}
