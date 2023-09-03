import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { StatusControllerHealthCheckParameter } from '../parameters/status-controller-health-check.parameter';
import { StatusControllerHealthCheckResponse } from '../responses/status-controller-health-check.response';

@Injectable()
@OperationCommand({
  serverId: 'service-status',
  operationId: 'StatusController_healthCheck',
  operation: '{"operationId":"StatusController_healthCheck","parameters":[{"name":"service","required":true,"in":"query","schema":{"type":"array","items":{"type":"string"}}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}}},"method":"get","path":"/many"}',
})
export class StatusControllerHealthCheckCommand
  extends OpenApiOperationCommand<StatusControllerHealthCheckResponse, StatusControllerHealthCheckParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<StatusControllerHealthCheckParameter, void>): Promise<StatusControllerHealthCheckResponse> {
    return super.execute(parameters);
  }
}
