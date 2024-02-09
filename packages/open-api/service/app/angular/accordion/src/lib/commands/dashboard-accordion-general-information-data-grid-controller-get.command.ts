import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-data-grid-controller-get.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDataGridController_get',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDataGridController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"number"}},"required":["name"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-data-grid"}'
  })
export class DashboardAccordionGeneralInformationDataGridControllerGetCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationDataGridControllerGetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DashboardAccordionGeneralInformationDataGridControllerGetResponse> {
    return super.execute(parameters);
  }
}
