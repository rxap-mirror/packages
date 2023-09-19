import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerGetResponse } from '../responses/settings-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_get',
  operation: `{
  "operationId": "SettingsController_get",
  "parameters": [],
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
  "method": "get",
  "path": "/settings"
}`,
})
export class SettingsControllerGetRemoteMethod extends OpenApiRemoteMethod<SettingsControllerGetResponse, void, void> {
  public override call(): Promise<SettingsControllerGetResponse> {
    return super.call();
  }
}
