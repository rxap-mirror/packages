import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerTogglePropertyParameter } from '../parameters/settings-controller-toggle-property.parameter';

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
    "200": {}
  },
  "method": "put",
  "path": "/settings/{propertyPath}/toggle"
}`,
})
export class SettingsControllerTogglePropertyRemoteMethod
  extends OpenApiRemoteMethod<void, SettingsControllerTogglePropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerTogglePropertyParameter, void>): Promise<void> {
    return super.call(parameters);
  }
}
