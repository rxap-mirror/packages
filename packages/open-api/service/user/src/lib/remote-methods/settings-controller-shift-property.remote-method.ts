import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerShiftPropertyParameter } from '../parameters/settings-controller-shift-property.parameter';
import { SettingsControllerShiftPropertyResponse } from '../responses/settings-controller-shift-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_shiftProperty',
  operation: `{
  "operationId": "SettingsController_shiftProperty",
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
            "type": "object"
          }
        }
      }
    }
  },
  "method": "delete",
  "path": "/settings/{propertyPath}/shift"
}`,
})
export class SettingsControllerShiftPropertyRemoteMethod
  extends OpenApiRemoteMethod<SettingsControllerShiftPropertyResponse, SettingsControllerShiftPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerShiftPropertyParameter, void>): Promise<SettingsControllerShiftPropertyResponse> {
    return super.call(parameters);
  }
}
