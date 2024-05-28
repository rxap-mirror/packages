import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DarkModeControllerToggleResponse } from '../responses/dark-mode-controller-toggle.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'DarkModeController_toggle',
  operation: `{
  "operationId": "DarkModeController_toggle",
  "parameters": [],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "boolean"
          }
        }
      }
    }
  },
  "method": "put",
  "path": "/settings/dark-mode/toggle"
}`
})
export class DarkModeControllerToggleRemoteMethod
  extends OpenApiRemoteMethod<DarkModeControllerToggleResponse, void, void> {
  public override call(): Promise<DarkModeControllerToggleResponse> {
    return super.call();
  }
}
