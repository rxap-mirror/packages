import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ThemeControllerGetResponse } from '../responses/theme-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'ThemeController_get',
  operation: `{
  "operationId": "ThemeController_get",
  "parameters": [],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "density": {
                "type": "number",
                "enum": [
                  -3,
                  -2,
                  -1,
                  0
                ]
              },
              "typography": {
                "type": "string"
              },
              "preset": {
                "type": "string"
              }
            },
            "additionalProperties": true,
            "required": [
              "preset"
            ]
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/settings/theme"
}`
})
export class ThemeControllerGetRemoteMethod<TResponse = unknown>
  extends OpenApiRemoteMethod<ThemeControllerGetResponse<TResponse>, void, void> {
  public override call(): Promise<ThemeControllerGetResponse<TResponse>> {
    return super.call();
  }
}
