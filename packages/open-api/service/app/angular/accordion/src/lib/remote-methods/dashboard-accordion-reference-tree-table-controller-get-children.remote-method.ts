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
    },
    {
      "name": "filter",
      "required": false,
      "in": "query",
      "schema": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    {
      "name": "sortBy",
      "required": false,
      "in": "query",
      "schema": {
        "type": "string"
      }
    },
    {
      "name": "sortDirection",
      "required": false,
      "in": "query",
      "schema": {
        "type": "string"
      }
    },
    {
      "name": "pageSize",
      "required": false,
      "in": "query",
      "schema": {
        "type": "number"
      }
    },
    {
      "name": "pageIndex",
      "required": false,
      "in": "query",
      "schema": {
        "type": "number"
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
  "path": "/dashboard-accordion/{uuid}/reference-tree-table/{parentUuid}"
}`
  })
export class DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod extends OpenApiRemoteMethod<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse, DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void>): Promise<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse> {
    return super.call(parameters);
  }
}
