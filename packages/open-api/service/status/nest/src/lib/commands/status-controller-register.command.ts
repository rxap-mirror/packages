import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import {
  StatusControllerRegisterRequestBody,
  StatusControllerRegisterResponse,
} from '@rxap/open-api-service-status';

@Injectable()
@OperationCommand({
  serverId: 'service-status',
  operationId: 'StatusController_register',
  operation: '{"operationId":"StatusController_register","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"url":{"type":"string"},"port":{"type":"number"}},"required":["name"]}}}},"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}},"201":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"post","path":"/register"}',
})
export class StatusControllerRegisterCommand
  extends OpenApiOperationCommand<StatusControllerRegisterResponse, void, StatusControllerRegisterRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, StatusControllerRegisterRequestBody>): Promise<StatusControllerRegisterResponse> {
    return super.execute(parameters);
  }
}
