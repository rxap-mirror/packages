import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerUnshiftPropertyParameter } from '../parameters/settings-controller-unshift-property.parameter';
import { SettingsControllerUnshiftPropertyResponse } from '../responses/settings-controller-unshift-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_unshiftProperty',
  operation: `{
  "operationId": "SettingsController_unshiftProperty",
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
            "type": "number"
          }
        }
      }
    }
  },
  "method": "put",
  "path": "/settings/{propertyPath}/unshift"
}`
})
export class SettingsControllerUnshiftPropertyRemoteMethod
  extends OpenApiRemoteMethod<SettingsControllerUnshiftPropertyResponse, SettingsControllerUnshiftPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerUnshiftPropertyParameter, void>): Promise<SettingsControllerUnshiftPropertyResponse> {
    return super.call(parameters);
  }
}
