import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-controller-submit.request-body';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_submit',
    operation: '{"operationId":"DashboardAccordionGeneralInformationCloudDashboardController_submit","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","company","dashboardType"]}}}},"responses":{"201":{}},"method":"post","path":"/dashboard-accordion/{uuid}/general-information-cloud-dashboard"}'
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitCommand extends OpenApiOperationCommand<void, void, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
