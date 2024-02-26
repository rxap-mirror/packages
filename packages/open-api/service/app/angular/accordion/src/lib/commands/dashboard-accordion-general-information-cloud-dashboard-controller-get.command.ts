import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_get',
    operation: '{"operationId":"DashboardAccordionGeneralInformationCloudDashboardController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","company","dashboardType"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-cloud-dashboard"}'
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse> {
    return super.execute(parameters);
  }
}
