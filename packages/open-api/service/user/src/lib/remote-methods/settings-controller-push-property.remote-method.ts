import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerPushPropertyParameter } from '../parameters/settings-controller-push-property.parameter';
import { SettingsControllerPushPropertyResponse } from '../responses/settings-controller-push-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_pushProperty',
  operation: `{
  "operationId": "SettingsController_pushProperty",
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
  "path": "/settings/{propertyPath}/push"
}`,
})
export class SettingsControllerPushPropertyRemoteMethod
  extends OpenApiRemoteMethod<SettingsControllerPushPropertyResponse, SettingsControllerPushPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerPushPropertyParameter, void>): Promise<SettingsControllerPushPropertyResponse> {
    return super.call(parameters);
  }
}
