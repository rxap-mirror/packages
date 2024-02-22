import { Injectable } from '@angular/core';
import { OpenApiRemoteMethod, OpenApiRemoteMethodParameter, RxapOpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { DashboardAccordionReferenceTreeTableControllerGetChildrenParameter } from '../parameters/dashboard-accordion-reference-tree-table-controller-get-children.parameter';
import { DashboardAccordionReferenceTreeTableControllerGetChildrenResponse } from '../responses/dashboard-accordion-reference-tree-table-controller-get-children.response';

@Injectable({
    providedIn: 'root'
  })
@RxapOpenApiRemoteMethod({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionReferenceTreeTableController_getChildren',
    operation: `{
  "operationId": "DashboardAccordionReferenceTreeTableController_getChildren",
  "parameters": [
    {
      "name": "parentUuid",
      "required": true,
      "in": "path",
      "schema": {
        "type": "string"
      }
    }
  ],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "uuid": {
                  "type": "string"
                },
                "hasChildren": {
                  "type": "boolean"
                },
                "referenced": {
                  "type": "boolean"
                },
                "name": {
                  "type": "string"
                },
                "type": {
                  "type": "string"
                },
                "children": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DashboardAccordionReferenceTreeTableItemDto"
                  }
                }
              },
              "required": [
                "uuid",
                "hasChildren",
                "referenced",
                "name",
                "type"
              ]
            }
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/dashboard-accordion/{uuid}/reference-tree-table/{parentUuid}"
}`
  })
export class DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse, DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void>): Promise<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse> {
    return super.call(parameters);
  }
}
