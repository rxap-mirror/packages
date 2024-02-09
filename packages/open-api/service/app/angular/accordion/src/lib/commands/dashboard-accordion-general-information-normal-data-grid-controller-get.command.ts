import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-normal-data-grid-controller-get.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationNormalDataGridController_get',
    operation: '{"operationId":"DashboardAccordionGeneralInformationNormalDataGridController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"number"}},"required":["name"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-normal-data-grid"}'
  })
export class DashboardAccordionGeneralInformationNormalDataGridControllerGetCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse> {
    return super.execute(parameters);
  }
}
