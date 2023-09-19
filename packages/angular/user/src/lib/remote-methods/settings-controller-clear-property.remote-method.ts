import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerClearPropertyParameter } from '../parameters/settings-controller-clear-property.parameter';

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
    "200": {}
  },
  "method": "delete",
  "path": "/settings/{propertyPath}"
}`,
})
export class SettingsControllerClearPropertyRemoteMethod
  extends OpenApiRemoteMethod<void, SettingsControllerClearPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerClearPropertyParameter, void>): Promise<void> {
    return super.call(parameters);
  }
}
