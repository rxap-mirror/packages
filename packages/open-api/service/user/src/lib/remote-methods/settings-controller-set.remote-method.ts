import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { SettingsControllerSetResponse } from '../responses/settings-controller-set.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'SettingsController_set',
  operation: `{
  "operationId": "SettingsController_set",
  "parameters": [],
  "responses": {
    "201": {
      "content": {
        "application/json": {
          "schema": {
            "type": "object"
          }
        }
      }
    }
  },
  "method": "post",
  "path": "/settings"
}`,
})
export class SettingsControllerSetRemoteMethod extends OpenApiRemoteMethod<SettingsControllerSetResponse, void, void> {
  public override call(): Promise<SettingsControllerSetResponse> {
    return super.call();
  }
}
