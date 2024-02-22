import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.response';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionLayoutCloudDashboardController_getById',
    operation: '{"operationId":"DashboardAccordionLayoutCloudDashboardController_getById","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{}}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/layout-cloud-dashboard"}'
  })
export class DashboardAccordionLayoutCloudDashboardControllerGetByIdCommand extends OpenApiOperationCommand<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse, DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void>): Promise<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse> {
    return super.execute(parameters);
  }
}
