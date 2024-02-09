import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-normal-data-grid-controller-get.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationNormalDataGridController_get',
    operation: `{
  "operationId": "DashboardAccordionGeneralInformationNormalDataGridController_get",
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
  "path": "/dashboard-accordion/{uuid}/general-information-normal-data-grid"
}`
  })
export class DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse, void, void> {
  public override call(): Promise<DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse> {
    return super.call();
  }
}
