import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerRemovePropertyParameter } from '../parameters/settings-controller-remove-property.parameter';
import { SettingsControllerRemovePropertyResponse } from '../responses/settings-controller-remove-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_removeProperty',
  operation: `{
  "operationId": "SettingsController_removeProperty",
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
  "path": "/settings/{propertyPath}/remove"
}`,
})
export class SettingsControllerRemovePropertyRemoteMethod
  extends OpenApiRemoteMethod<SettingsControllerRemovePropertyResponse, SettingsControllerRemovePropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerRemovePropertyParameter, void>): Promise<SettingsControllerRemovePropertyResponse> {
    return super.call(parameters);
  }
}
