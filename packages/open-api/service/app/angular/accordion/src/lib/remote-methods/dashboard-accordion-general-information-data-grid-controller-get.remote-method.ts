import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDataGridController_get',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationDataGridController_get",
  "parameters": [],
  "responses": {
    "200": {
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
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/general-information-data-grid"
}`
  })
export class DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationDataGridControllerGetResponse, void, void> {
  public override call(): Promise<DashboardAccordionGeneralInformationDataGridControllerGetResponse> {
    return super.call();
  }
}
