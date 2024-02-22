import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-dashboard-data-grid-controller-get.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardDataGridController_get',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDashboardDataGridController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"unknown"},"location":{"type":"unknown"},"link":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","location","link","company","dashboardType"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-dashboard-data-grid"}'
  })
export class DashboardAccordionGeneralInformationDashboardDataGridControllerGetCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse> {
    return super.execute(parameters);
  }
}
