import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-submit.request-body';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardDataGridController_submit',
    operation: '{"operationId":"DashboardAccordionGeneralInformationCloudDashboardDataGridController_submit","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"unknown"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","company","dashboardType"]}}}},"responses":{"201":{}},"method":"post","path":"/dashboard-accordion/{uuid}/general-information-cloud-dashboard-data-grid"}'
  })
export class DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitCommand extends OpenApiOperationCommand<void, void, DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
