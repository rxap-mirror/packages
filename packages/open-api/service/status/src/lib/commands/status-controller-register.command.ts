import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@eurogard/service-open-api';
import { Injectable } from '@nestjs/common';
import { StatusControllerRegisterRequestBody } from '../request-bodies/status-controller-register.request-body';

@Injectable()
@OperationCommand({
  serverId: 'service-status',
  operationId: 'StatusController_register',
  operation: '{"operationId":"StatusController_register","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"url":{"type":"string"}},"required":["name","url"]}}}},"responses":{"201":{}},"method":"post","path":"/register"}',
})
export class StatusControllerRegisterCommand
  extends OpenApiOperationCommand<void, void, StatusControllerRegisterRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, StatusControllerRegisterRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
