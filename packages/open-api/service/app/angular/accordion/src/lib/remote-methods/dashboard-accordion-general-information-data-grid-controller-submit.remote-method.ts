import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, OpenApiRemoteMethodParameter, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-data-grid-controller-submit.request-body';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDataGridController_submit',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationDataGridController_submit",
  "parameters": [],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "responses": {
    "201": {}
  },
  "method": "post",
  "path": "/dashboard-accordion/{uuid}/general-information-data-grid"
}`
  })
export class DashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod extends OpenApiRemoteMethod<void, void, DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
