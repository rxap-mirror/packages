import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionGeneralInformationDashboardControllerGetParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get.response';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_get',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDashboardController_get","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"location":{"type":"string"},"link":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"}},"required":["name","location","link","company","dashboardType"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-dashboard"}'
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationDashboardControllerGetResponse, DashboardAccordionGeneralInformationDashboardControllerGetParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionGeneralInformationDashboardControllerGetParameter, void>): Promise<DashboardAccordionGeneralInformationDashboardControllerGetResponse> {
    return super.execute(parameters);
  }
}
