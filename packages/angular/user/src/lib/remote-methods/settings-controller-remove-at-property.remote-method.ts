import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerRemoveAtPropertyParameter } from '../parameters/settings-controller-remove-at-property.parameter';

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
    "200": {}
  },
  "method": "delete",
  "path": "/settings/{propertyPath}/removeAt/{index}"
}`,
})
export class SettingsControllerRemoveAtPropertyRemoteMethod
  extends OpenApiRemoteMethod<void, SettingsControllerRemoveAtPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerRemoveAtPropertyParameter, void>): Promise<void> {
    return super.call(parameters);
  }
}
