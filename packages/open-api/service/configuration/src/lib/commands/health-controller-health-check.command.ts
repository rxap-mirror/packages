import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@eurogard/service-open-api';
import { Injectable } from '@nestjs/common';
import { HealthControllerHealthCheckResponse } from '../responses/health-controller-health-check.response';

@Injectable()
@OperationCommand({
  serverId: 'service-configuration',
  operationId: 'HealthController_healthCheck',
  operation: '{"operationId":"HealthController_healthCheck","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}}},"method":"get","path":"/health"}',
})
export class HealthControllerHealthCheckCommand
  extends OpenApiOperationCommand<HealthControllerHealthCheckResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<HealthControllerHealthCheckResponse> {
    return super.execute(parameters);
  }
}
