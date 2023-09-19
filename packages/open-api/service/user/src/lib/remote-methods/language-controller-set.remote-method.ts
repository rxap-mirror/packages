import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { LanguageControllerSetParameter } from '../parameters/language-controller-set.parameter';
import { LanguageControllerSetResponse } from '../responses/language-controller-set.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'LanguageController_set',
  operation: `{
  "operationId": "LanguageController_set",
  "parameters": [
    {
      "name": "language",
      "required": true,
      "in": "path",
      "schema": {
        "type": "string"
      }
    }
  ],
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
  "method": "put",
  "path": "/settings/language/{language}"
}`,
})
export class LanguageControllerSetRemoteMethod
  extends OpenApiRemoteMethod<LanguageControllerSetResponse, LanguageControllerSetParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<LanguageControllerSetParameter, void>): Promise<LanguageControllerSetResponse> {
    return super.call(parameters);
  }
}
