import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionLayoutControllerGetByIdResponse } from '../responses/dashboard-accordion-layout-controller-get-by-id.response';
import { DashboardAccordionLayoutControllerGetByIdParameter } from '../parameters/dashboard-accordion-layout-controller-get-by-id.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionLayoutController_getById',
    operation: '{"operationId":"DashboardAccordionLayoutController_getById","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{}}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/layout"}'
  })
export class DashboardAccordionLayoutControllerGetByIdCommand extends OpenApiOperationCommand<DashboardAccordionLayoutControllerGetByIdResponse, DashboardAccordionLayoutControllerGetByIdParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionLayoutControllerGetByIdParameter, void>): Promise<DashboardAccordionLayoutControllerGetByIdResponse> {
    return super.execute(parameters);
  }
}
