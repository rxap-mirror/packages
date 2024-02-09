import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-data-grid-controller-submit.request-body';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDataGridController_submit',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDataGridController_submit","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"number"}},"required":["name"]}}}},"responses":{"201":{}},"method":"post","path":"/dashboard-accordion/{uuid}/general-information-data-grid"}'
  })
export class DashboardAccordionGeneralInformationDataGridControllerSubmitCommand extends OpenApiOperationCommand<void, void, DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
