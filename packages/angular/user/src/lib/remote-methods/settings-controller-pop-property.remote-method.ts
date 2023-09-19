import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerPopPropertyParameter } from '../parameters/settings-controller-pop-property.parameter';
import { SettingsControllerPopPropertyResponse } from '../responses/settings-controller-pop-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_popProperty',
  operation: `{
  "operationId": "SettingsController_popProperty",
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
          "schema": {}
        }
      }
    }
  },
  "method": "delete",
  "path": "/settings/{propertyPath}/pop"
}`
})
export class SettingsControllerPopPropertyRemoteMethod<TResponse = unknown>
  extends OpenApiRemoteMethod<SettingsControllerPopPropertyResponse<TResponse>, SettingsControllerPopPropertyParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<SettingsControllerPopPropertyParameter, void>): Promise<SettingsControllerPopPropertyResponse<TResponse>> {
    return super.call(parameters);
  }
}
