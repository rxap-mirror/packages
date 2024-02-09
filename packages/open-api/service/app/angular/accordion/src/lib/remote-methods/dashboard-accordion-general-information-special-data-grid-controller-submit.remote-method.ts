import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, OpenApiRemoteMethodParameter, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-special-data-grid-controller-submit.request-body';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationSpecialDataGridController_submit',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationSpecialDataGridController_submit",
  "parameters": [],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "name": {
              "type": "number"
            }
          },
          "required": [
            "name"
          ]
        }
      }
    }
  },
  "responses": {
    "201": {}
  },
  "method": "post",
  "path": "/dashboard-accordion/{uuid}/general-information-special-data-grid"
}`
  })
export class DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod extends OpenApiRemoteMethod<void, void, DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
