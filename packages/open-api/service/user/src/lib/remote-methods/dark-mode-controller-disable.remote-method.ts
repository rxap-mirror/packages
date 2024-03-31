import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DarkModeControllerDisableResponse } from '../responses/dark-mode-controller-disable.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'DarkModeController_disable',
  operation: `{
  "operationId": "DarkModeController_disable",
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
  "path": "/settings/dark-mode/disable"
}`
})
export class DarkModeControllerDisableRemoteMethod
  extends OpenApiRemoteMethod<DarkModeControllerDisableResponse, void, void> {
  public override call(): Promise<DarkModeControllerDisableResponse> {
    return super.call();
  }
}
