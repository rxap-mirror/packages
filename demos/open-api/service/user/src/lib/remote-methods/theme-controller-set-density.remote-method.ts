import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ThemeControllerSetDensityRequestBody } from '../request-bodies/theme-controller-set-density.request-body';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'ThemeController_setDensity',
  operation: `{
  "operationId": "ThemeController_setDensity",
  "parameters": [],
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "value": {
              "type": "number",
              "minimum": -3,
              "maximum": 0
            }
          },
          "required": [
            "value"
          ]
        }
      }
    }
  },
  "responses": {
    "200": {}
  },
  "method": "put",
  "path": "/settings/theme/density"
}`
})
export class ThemeControllerSetDensityRemoteMethod
  extends OpenApiRemoteMethod<void, void, ThemeControllerSetDensityRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, ThemeControllerSetDensityRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
