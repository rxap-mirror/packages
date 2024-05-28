import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerRemovePropertyParameter } from '../parameters/settings-controller-remove-property.parameter';

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
    "200": {}
  },
  "method": "delete",
  "path": "/settings/{propertyPath}/remove"
}`
})
export class SettingsControllerRemovePropertyRemoteMethod
  extends OpenApiRemoteMethod<void, SettingsControllerRemovePropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerRemovePropertyParameter, void>): Promise<void> {
    return super.call(parameters);
  }
}
