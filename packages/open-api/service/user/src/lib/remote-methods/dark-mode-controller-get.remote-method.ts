import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { DarkModeControllerGetResponse } from '../responses/dark-mode-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'DarkModeController_get',
  operation: `{
  "operationId": "DarkModeController_get",
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
  "method": "get",
  "path": "/settings/dark-mode"
}`
})
export class DarkModeControllerGetRemoteMethod extends OpenApiRemoteMethod<DarkModeControllerGetResponse, void, void> {
  public override call(): Promise<DarkModeControllerGetResponse> {
    return super.call();
  }
}
