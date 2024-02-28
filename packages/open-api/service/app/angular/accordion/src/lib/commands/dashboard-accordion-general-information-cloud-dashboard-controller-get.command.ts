import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-get.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get.response';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_get',
    operation: '{"operationId":"DashboardAccordionGeneralInformationCloudDashboardController_get","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","company","dashboardType"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-cloud-dashboard"}'
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse, DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter, void>): Promise<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse> {
    return super.execute(parameters);
  }
}
