import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-submit.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-controller-submit.request-body';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_submit',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationCloudDashboardController_submit",
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
  },
  "responses": {
    "201": {}
  },
  "method": "post",
  "path": "/dashboard-accordion/{uuid}/general-information-cloud-dashboard"
}`
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod extends OpenApiRemoteMethod<void, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
