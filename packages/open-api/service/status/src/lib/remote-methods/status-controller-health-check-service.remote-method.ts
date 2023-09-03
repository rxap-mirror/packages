import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { StatusControllerHealthCheckServiceParameter } from '../parameters/status-controller-health-check-service.parameter';
import { StatusControllerHealthCheckServiceResponse } from '../responses/status-controller-health-check-service.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-status',
  operationId: 'StatusController_healthCheckService',
  operation: '{"operationId":"StatusController_healthCheckService","parameters":[{"name":"name","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}}},"method":"get","path":"/{name}"}',
})
export class StatusControllerHealthCheckServiceRemoteMethod
  extends OpenApiRemoteMethod<StatusControllerHealthCheckServiceResponse, StatusControllerHealthCheckServiceParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>): Promise<StatusControllerHealthCheckServiceResponse> {
    return super.call(parameters);
  }
}
