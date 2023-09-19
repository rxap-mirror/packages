import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { LanguageControllerGetResponse } from '../responses/language-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'LanguageController_get',
  operation: `{
  "operationId": "LanguageController_get",
  "parameters": [],
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "string"
          }
        }
      }
    }
  },
  "method": "get",
  "path": "/settings/language"
}`,
})
export class LanguageControllerGetRemoteMethod extends OpenApiRemoteMethod<LanguageControllerGetResponse, void, void> {
  public override call(): Promise<LanguageControllerGetResponse> {
    return super.call();
  }
}
