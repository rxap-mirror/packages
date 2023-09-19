import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerDecrementPropertyParameter } from '../parameters/settings-controller-decrement-property.parameter';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_decrementProperty',
  operation: `{
  "operationId": "SettingsController_decrementProperty",
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
    "200": {}
  },
  "method": "put",
  "path": "/settings/{propertyPath}/decrement"
}`,
})
export class SettingsControllerDecrementPropertyRemoteMethod
  extends OpenApiRemoteMethod<void, SettingsControllerDecrementPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerDecrementPropertyParameter, void>): Promise<void> {
    return super.call(parameters);
  }
}
