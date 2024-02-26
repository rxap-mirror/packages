import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-dashboard-controller-submit.request-body';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_submit',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDashboardController_submit","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"location":{"type":"string"},"link":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","location","link","company","dashboardType"]}}}},"responses":{"201":{}},"method":"post","path":"/dashboard-accordion/{uuid}/general-information-dashboard"}'
  })
export class DashboardAccordionGeneralInformationDashboardControllerSubmitCommand extends OpenApiOperationCommand<void, void, DashboardAccordionGeneralInformationDashboardControllerSubmitRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, DashboardAccordionGeneralInformationDashboardControllerSubmitRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
