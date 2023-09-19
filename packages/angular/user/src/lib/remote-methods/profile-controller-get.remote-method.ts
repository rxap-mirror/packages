import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ProfileControllerGetResponse } from '../responses/profile-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'ProfileController_get',
  operation: `{
  "operationId": "ProfileController_get",
  "parameters": [],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {}
        }
      }
    }
  },
  "method": "get",
  "path": "/profile"
}`,
})
export class ProfileControllerGetRemoteMethod<TResponse = unknown>
  extends OpenApiRemoteMethod<ProfileControllerGetResponse<TResponse>, void, void> {
  public override call(): Promise<ProfileControllerGetResponse<TResponse>> {
    return super.call();
  }
}
