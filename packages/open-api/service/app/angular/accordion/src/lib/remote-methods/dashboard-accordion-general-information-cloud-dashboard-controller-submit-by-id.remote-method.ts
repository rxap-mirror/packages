import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.request-body';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_submitById',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationCloudDashboardController_submitById",
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
  },
  "responses": {
    "201": {}
  },
  "method": "post",
  "path": "/dashboard-accordion/{uuid}/general-information-cloud-dashboard"
}`
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod extends OpenApiRemoteMethod<void, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
