import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-dashboard-data-grid-controller-submit.request-body';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardDataGridController_submit',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDashboardDataGridController_submit","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"unknown"},"location":{"type":"unknown"},"link":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","location","link","company","dashboardType"]}}}},"responses":{"201":{}},"method":"post","path":"/dashboard-accordion/{uuid}/general-information-dashboard-data-grid"}'
  })
export class DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitCommand extends OpenApiOperationCommand<void, void, DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
