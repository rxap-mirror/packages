import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerPushPropertyParameter } from '../parameters/settings-controller-push-property.parameter';

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
    "200": {}
  },
  "method": "put",
  "path": "/settings/{propertyPath}/push"
}`
})
export class SettingsControllerPushPropertyRemoteMethod
  extends OpenApiRemoteMethod<void, SettingsControllerPushPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerPushPropertyParameter, void>): Promise<void> {
    return super.call(parameters);
  }
}
