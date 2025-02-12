import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse } from '../responses/dashboard-accordion-reference-controller-get-scope-type-options.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionReferenceController_getScopeTypeOptions',
    operation: `{
  "operationId": "DashboardAccordionReferenceController_getScopeTypeOptions",
  "parameters": [],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "display": {
                  "type": "string"
                },
                "value": {
                  "type": "number"
                }
              },
              "required": [
                "display",
                "value"
              ]
            }
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/reference/control/scope-type/options"
}`
  })
export class DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse, void, void> {
  public override call(): Promise<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse> {
    return super.call();
  }
}
