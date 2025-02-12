import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { StatusControllerHealthCheckServiceParameter } from '../parameters/status-controller-health-check-service.parameter';
import { StatusControllerHealthCheckServiceResponse } from '../responses/status-controller-health-check-service.response';

@Injectable()
@OperationCommand({
  serverId: 'service-status',
  operationId: 'StatusController_healthCheckService',
  operation: '{"operationId":"StatusController_healthCheckService","parameters":[{"name":"name","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}}},"method":"get","path":"/{name}"}',
})
export class StatusControllerHealthCheckServiceCommand
  extends OpenApiOperationCommand<StatusControllerHealthCheckServiceResponse, StatusControllerHealthCheckServiceParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<StatusControllerHealthCheckServiceParameter, void>): Promise<StatusControllerHealthCheckServiceResponse> {
    return super.execute(parameters);
  }
}
