import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerSetRequestBody } from '../request-bodies/settings-controller-set.request-body';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_set',
  operation: `{
  "operationId": "SettingsController_set",
  "parameters": [],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "darkMode": {
              "type": "boolean"
            },
            "language": {
              "type": "string"
            },
            "theme": {
              "type": "object",
              "properties": {
                "preset": {
                  "type": "string"
                },
                "density": {
                  "type": "number",
                  "enum": [
                    0,
                    -1,
                    -2,
                    -3
                  ]
                },
                "typography": {
                  "type": "string"
                }
              },
              "additionalProperties": true
            }
          },
          "additionalProperties": true
        }
      }
    }
  },
  "responses": {
    "201": {}
  },
  "method": "post",
  "path": "/settings"
}`
})
export class SettingsControllerSetRemoteMethod<TRequestBody = unknown>
  extends OpenApiRemoteMethod<void, void, SettingsControllerSetRequestBody<TRequestBody>> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, SettingsControllerSetRequestBody<TRequestBody>>): Promise<void> {
    return super.call(parameters);
  }
}
