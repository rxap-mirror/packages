import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerClearPropertyParameter } from '../parameters/settings-controller-clear-property.parameter';
import { SettingsControllerClearPropertyResponse } from '../responses/settings-controller-clear-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_clearProperty',
  operation: `{
  "operationId": "SettingsController_clearProperty",
  "parameters": [
    {
      "name": "propertyPath",
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
            "type": "object"
          }
        }
      }
    }
  },
  "method": "delete",
  "path": "/settings/{propertyPath}"
}`,
})
export class SettingsControllerClearPropertyRemoteMethod
  extends OpenApiRemoteMethod<SettingsControllerClearPropertyResponse, SettingsControllerClearPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerClearPropertyParameter, void>): Promise<SettingsControllerClearPropertyResponse> {
    return super.call(parameters);
  }
}
