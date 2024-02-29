import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-by-id.response';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_getById',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDashboardController_getById","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"location":{"type":"string"},"link":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"},"uuid":{"type":"string"}},"required":["name","location","link","company","dashboardType","uuid"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-dashboard"}'
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetByIdCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse, DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void>): Promise<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse> {
    return super.execute(parameters);
  }
}
