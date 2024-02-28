import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-submit.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-controller-submit.request-body';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_submit',
    operation: '{"operationId":"DashboardAccordionGeneralInformationCloudDashboardController_submit","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","company","dashboardType"]}}}},"responses":{"201":{}},"method":"post","path":"/dashboard-accordion/{uuid}/general-information-cloud-dashboard"}'
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitCommand extends OpenApiOperationCommand<void, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
