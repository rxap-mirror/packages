import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerGetPropertyParameter } from '../parameters/settings-controller-get-property.parameter';
import { SettingsControllerGetPropertyResponse } from '../responses/settings-controller-get-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_getProperty',
  operation: `{
  "operationId": "SettingsController_getProperty",
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
          "schema": {}
        }
      }
    }
  },
  "method": "get",
  "path": "/settings/{propertyPath}"
}`,
})
export class SettingsControllerGetPropertyRemoteMethod
  extends OpenApiRemoteMethod<SettingsControllerGetPropertyResponse, SettingsControllerGetPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerGetPropertyParameter, void>): Promise<SettingsControllerGetPropertyResponse> {
    return super.call(parameters);
  }
}
