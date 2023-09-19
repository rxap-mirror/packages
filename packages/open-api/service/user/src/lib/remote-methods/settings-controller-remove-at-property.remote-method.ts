import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerRemoveAtPropertyParameter } from '../parameters/settings-controller-remove-at-property.parameter';
import { SettingsControllerRemoveAtPropertyResponse } from '../responses/settings-controller-remove-at-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_removeAtProperty',
  operation: `{
  "operationId": "SettingsController_removeAtProperty",
  "parameters": [
    {
      "name": "propertyPath",
      "required": true,
      "in": "path",
      "schema": {
        "type": "string"
      }
    },
    {
      "name": "index",
      "required": true,
      "in": "path",
      "schema": {
        "type": "number"
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
  "path": "/settings/{propertyPath}/removeAt/{index}"
}`,
})
export class SettingsControllerRemoveAtPropertyRemoteMethod
  extends OpenApiRemoteMethod<SettingsControllerRemoveAtPropertyResponse, SettingsControllerRemoveAtPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerRemoveAtPropertyParameter, void>): Promise<SettingsControllerRemoveAtPropertyResponse> {
    return super.call(parameters);
  }
}
