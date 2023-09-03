import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { HealthControllerHealthCheckResponse } from '../responses/health-controller-health-check.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-status',
  operationId: 'HealthController_healthCheck',
  operation: '{"operationId":"HealthController_healthCheck","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}}},"method":"get","path":"/health"}',
})
export class HealthControllerHealthCheckRemoteMethod
  extends OpenApiRemoteMethod<HealthControllerHealthCheckResponse, void, void> {
  public override call(): Promise<HealthControllerHealthCheckResponse> {
    return super.call();
  }
}
