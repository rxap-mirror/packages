import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionReferenceTreeTableControllerGetRootResponse } from '../responses/dashboard-accordion-reference-tree-table-controller-get-root.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionReferenceTreeTableController_getRoot',
    operation: `{
  "operationId": "DashboardAccordionReferenceTreeTableController_getRoot",
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
                "referenced": {
                  "type": "boolean"
                },
                "name": {
                  "type": "string"
                },
                "type": {
                  "type": "string"
                },
                "hasChildren": {
                  "type": "boolean"
                },
                "children": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DashboardAccordionReferenceTreeTableItemDto"
                  }
                }
              },
              "required": [
                "referenced",
                "name",
                "type",
                "hasChildren"
              ]
            }
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/reference-tree-table"
}`
  })
export class DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionReferenceTreeTableControllerGetRootResponse, void, void> {
  public override call(): Promise<DashboardAccordionReferenceTreeTableControllerGetRootResponse> {
    return super.call();
  }
}
