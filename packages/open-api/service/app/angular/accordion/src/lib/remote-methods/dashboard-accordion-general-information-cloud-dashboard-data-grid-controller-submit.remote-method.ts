import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, OpenApiRemoteMethodParameter, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-submit.request-body';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardDataGridController_submit',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationCloudDashboardDataGridController_submit",
  "parameters": [],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "name": {
              "type": "unknown"
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
  "path": "/dashboard-accordion/{uuid}/general-information-cloud-dashboard-data-grid"
}`
  })
export class DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod extends OpenApiRemoteMethod<void, void, DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
