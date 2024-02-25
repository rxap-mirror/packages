import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-get.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardDataGridController_get',
    operation: '{"operationId":"DashboardAccordionGeneralInformationCloudDashboardDataGridController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","company","dashboardType"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-cloud-dashboard-data-grid"}'
  })
export class DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse> {
    return super.execute(parameters);
  }
}
