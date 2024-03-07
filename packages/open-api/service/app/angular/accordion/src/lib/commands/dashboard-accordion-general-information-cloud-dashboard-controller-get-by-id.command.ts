import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.response';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_getById',
    operation: '{"operationId":"DashboardAccordionGeneralInformationCloudDashboardController_getById","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"},"uuid":{"type":"string"}},"required":["name","company","dashboardType","uuid"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-cloud-dashboard"}'
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse, DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void>): Promise<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse> {
    return super.execute(parameters);
  }
}
