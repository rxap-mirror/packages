import { Injectable } from '@angular/core';
import { HealthControllerHealthCheckResponse } from '@rxap/open-api-service-configuration';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-configuration',
  operationId: 'HealthController_healthCheck',
  operation: '{"operationId":"HealthController_healthCheck","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}}},"method":"get","path":"/health"}',
})
export class HealthControllerHealthCheckRemoteMethod
  extends OpenApiRemoteMethod<HealthControllerHealthCheckResponse, void, void> {
  public override call(): Promise<HealthControllerHealthCheckResponse> {
    return super.call();
  }
}
