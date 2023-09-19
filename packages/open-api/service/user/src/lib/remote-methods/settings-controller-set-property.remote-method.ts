import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerSetPropertyParameter } from '../parameters/settings-controller-set-property.parameter';
import { SettingsControllerSetPropertyResponse } from '../responses/settings-controller-set-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_setProperty',
  operation: `{
  "operationId": "SettingsController_setProperty",
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
  "method": "put",
  "path": "/settings/{propertyPath}"
}`,
})
export class SettingsControllerSetPropertyRemoteMethod
  extends OpenApiRemoteMethod<SettingsControllerSetPropertyResponse, SettingsControllerSetPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerSetPropertyParameter, void>): Promise<SettingsControllerSetPropertyResponse> {
    return super.call(parameters);
  }
}
