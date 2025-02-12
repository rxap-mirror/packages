import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DarkModeControllerEnableResponse } from '../responses/dark-mode-controller-enable.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'DarkModeController_enable',
  operation: `{
  "operationId": "DarkModeController_enable",
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
  "path": "/settings/dark-mode/enable"
}`
})
export class DarkModeControllerEnableRemoteMethod
  extends OpenApiRemoteMethod<DarkModeControllerEnableResponse, void, void> {
  public override call(): Promise<DarkModeControllerEnableResponse> {
    return super.call();
  }
}
