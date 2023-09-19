import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerGetResponse } from '../responses/settings-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_get',
  operation: `{
  "operationId": "SettingsController_get",
  "parameters": [],
  "responses": {
    "200": {
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
              }
            },
            "additionalProperties": true,
            "required": [
              "darkMode",
              "language"
            ]
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/settings"
}`,
})
export class SettingsControllerGetRemoteMethod<TResponse = unknown>
  extends OpenApiRemoteMethod<SettingsControllerGetResponse<TResponse>, void, void> {
  public override call(): Promise<SettingsControllerGetResponse<TResponse>> {
    return super.call();
  }
}
