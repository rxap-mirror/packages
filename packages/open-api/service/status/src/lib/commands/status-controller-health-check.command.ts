import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@eurogard/service-open-api';
import { Injectable } from '@nestjs/common';
import { StatusControllerHealthCheckResponse } from '../responses/status-controller-health-check.response';

@Injectable()
@OperationCommand({
  serverId: 'service-status',
  operationId: 'StatusController_healthCheck',
  operation: '{"operationId":"StatusController_healthCheck","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}}},"method":"get","path":"/all"}',
})
export class StatusControllerHealthCheckCommand
  extends OpenApiOperationCommand<StatusControllerHealthCheckResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<StatusControllerHealthCheckResponse> {
    return super.execute(parameters);
  }
}
