import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ThemeControllerSetTypographyRequestBody } from '../request-bodies/theme-controller-set-typography.request-body';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'ThemeController_setTypography',
  operation: `{
  "operationId": "ThemeController_setTypography",
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
  "path": "/settings/theme/typography"
}`,
})
export class ThemeControllerSetTypographyRemoteMethod
  extends OpenApiRemoteMethod<void, void, ThemeControllerSetTypographyRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, ThemeControllerSetTypographyRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}
