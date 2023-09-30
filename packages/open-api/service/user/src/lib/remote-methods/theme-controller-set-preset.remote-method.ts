import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ThemeControllerSetPresetRequestBody } from '../request-bodies/theme-controller-set-preset.request-body';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'ThemeController_setPreset',
  operation: `{
  "operationId": "ThemeController_setPreset",
  "parameters": [],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "responses": {
    "200": {}
  },
  "method": "put",
  "path": "/settings/theme/preset"
}`
})
export class ThemeControllerSetPresetRemoteMethod
  extends OpenApiRemoteMethod<void, void, ThemeControllerSetPresetRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, ThemeControllerSetPresetRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
