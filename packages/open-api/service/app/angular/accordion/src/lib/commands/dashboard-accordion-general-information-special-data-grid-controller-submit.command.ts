import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-special-data-grid-controller-submit.request-body';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationSpecialDataGridController_submit',
    operation: '{"operationId":"DashboardAccordionGeneralInformationSpecialDataGridController_submit","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"number"}},"required":["name"]}}}},"responses":{"201":{}},"method":"post","path":"/dashboard-accordion/{uuid}/general-information-special-data-grid"}'
  })
export class DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitCommand extends OpenApiOperationCommand<void, void, DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
