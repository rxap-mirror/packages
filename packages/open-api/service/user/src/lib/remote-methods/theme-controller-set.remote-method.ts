import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ThemeControllerSetRequestBody } from '../request-bodies/theme-controller-set.request-body';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'ThemeController_set',
  operation: `{
  "operationId": "ThemeController_set",
  "parameters": [],
  "requestBody": {
    "required": true,
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
  },
  "responses": {
    "200": {}
  },
  "method": "put",
  "path": "/settings/theme"
}`,
})
export class ThemeControllerSetRemoteMethod<TRequestBody = unknown>
  extends OpenApiRemoteMethod<void, void, ThemeControllerSetRequestBody<TRequestBody>> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, ThemeControllerSetRequestBody<TRequestBody>>): Promise<void> {
    return super.call(parameters);
  }
}
