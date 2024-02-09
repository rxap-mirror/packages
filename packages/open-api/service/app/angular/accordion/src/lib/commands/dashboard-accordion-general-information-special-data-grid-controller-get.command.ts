import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-special-data-grid-controller-get.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationSpecialDataGridController_get',
    operation: '{"operationId":"DashboardAccordionGeneralInformationSpecialDataGridController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"number"}},"required":["name"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-special-data-grid"}'
  })
export class DashboardAccordionGeneralInformationSpecialDataGridControllerGetCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse> {
    return super.execute(parameters);
  }
}
