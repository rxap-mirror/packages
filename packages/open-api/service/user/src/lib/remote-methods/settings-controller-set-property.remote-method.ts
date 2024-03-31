import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerSetPropertyParameter } from '../parameters/settings-controller-set-property.parameter';

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
    "200": {}
  },
  "method": "put",
  "path": "/settings/{propertyPath}"
}`
})
export class SettingsControllerSetPropertyRemoteMethod
  extends OpenApiRemoteMethod<void, SettingsControllerSetPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerSetPropertyParameter, void>): Promise<void> {
    return super.call(parameters);
  }
}
