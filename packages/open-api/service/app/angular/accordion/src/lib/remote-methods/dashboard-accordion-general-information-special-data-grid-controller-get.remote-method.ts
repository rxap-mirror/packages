import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-special-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationSpecialDataGridController_get',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationSpecialDataGridController_get",
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
  "path": "/dashboard-accordion/{uuid}/general-information-special-data-grid"
}`
  })
export class DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse, void, void> {
  public override call(): Promise<DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse> {
    return super.call();
  }
}
