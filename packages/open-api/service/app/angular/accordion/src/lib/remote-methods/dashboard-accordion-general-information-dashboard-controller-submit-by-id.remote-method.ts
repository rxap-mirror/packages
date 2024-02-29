import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-submit-by-id.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody } from '../request-bodies/dashboard-accordion-general-information-dashboard-controller-submit-by-id.request-body';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_submitById',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationDashboardController_submitById",
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
  "requestBody": {
    "required": true,
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
  },
  "responses": {
    "201": {}
  },
  "method": "post",
  "path": "/dashboard-accordion/{uuid}/general-information-dashboard"
}`
  })
export class DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod extends OpenApiRemoteMethod<void, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
