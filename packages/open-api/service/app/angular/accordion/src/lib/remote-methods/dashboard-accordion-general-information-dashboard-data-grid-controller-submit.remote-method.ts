import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, OpenApiRemoteMethodParameter, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-dashboard-data-grid-controller-submit.request-body';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardDataGridController_submit',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationDashboardDataGridController_submit",
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
            "location": {
              "type": "unknown"
            },
            "link": {
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
            "location",
            "link",
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
  "path": "/dashboard-accordion/{uuid}/general-information-dashboard-data-grid"
}`
  })
export class DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod extends OpenApiRemoteMethod<void, void, DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
