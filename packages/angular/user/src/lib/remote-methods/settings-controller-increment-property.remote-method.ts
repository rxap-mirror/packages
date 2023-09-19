import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerIncrementPropertyParameter } from '../parameters/settings-controller-increment-property.parameter';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_incrementProperty',
  operation: `{
  "operationId": "SettingsController_incrementProperty",
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
  "path": "/settings/{propertyPath}/increment"
}`,
})
export class SettingsControllerIncrementPropertyRemoteMethod
  extends OpenApiRemoteMethod<void, SettingsControllerIncrementPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerIncrementPropertyParameter, void>): Promise<void> {
    return super.call(parameters);
  }
}
