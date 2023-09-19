import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerTogglePropertyParameter } from '../parameters/settings-controller-toggle-property.parameter';
import { SettingsControllerTogglePropertyResponse } from '../responses/settings-controller-toggle-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_toggleProperty',
  operation: `{
  "operationId": "SettingsController_toggleProperty",
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
  "path": "/settings/{propertyPath}/toggle"
}`,
})
export class SettingsControllerTogglePropertyRemoteMethod
  extends OpenApiRemoteMethod<SettingsControllerTogglePropertyResponse, SettingsControllerTogglePropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerTogglePropertyParameter, void>): Promise<SettingsControllerTogglePropertyResponse> {
    return super.call(parameters);
  }
}
