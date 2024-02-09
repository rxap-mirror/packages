import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionControllerGetByIdResponse } from '../responses/dashboard-accordion-controller-get-by-id.response';
import { DashboardAccordionControllerGetByIdParameter } from '../parameters/dashboard-accordion-controller-get-by-id.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionController_getById',
    operation: '{"operationId":"DashboardAccordionController_getById","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"uuid":{"type":"string"},"name":{"type":"string"}},"required":["uuid","name"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}"}'
  })
export class DashboardAccordionControllerGetByIdCommand extends OpenApiOperationCommand<DashboardAccordionControllerGetByIdResponse, DashboardAccordionControllerGetByIdParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionControllerGetByIdParameter, void>): Promise<DashboardAccordionControllerGetByIdResponse> {
    return super.execute(parameters);
  }
}
