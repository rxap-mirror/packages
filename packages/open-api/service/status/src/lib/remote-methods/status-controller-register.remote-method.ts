import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { StatusControllerRegisterRequestBody } from '../request-bodies/status-controller-register.request-body';
import { StatusControllerRegisterResponse } from '../responses/status-controller-register.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-status',
  operationId: 'StatusController_register',
  operation: '{"operationId":"StatusController_register","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"url":{"type":"string"},"port":{"type":"number"}},"required":["name"]}}}},"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}},"201":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"post","path":"/register"}',
})
export class StatusControllerRegisterRemoteMethod
  extends OpenApiRemoteMethod<StatusControllerRegisterResponse, void, StatusControllerRegisterRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>): Promise<StatusControllerRegisterResponse> {
    return super.call(parameters);
  }
}
