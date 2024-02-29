import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-submit-by-id.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody } from '../request-bodies/dashboard-accordion-general-information-dashboard-controller-submit-by-id.request-body';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_submitById',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDashboardController_submitById","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"location":{"type":"string"},"link":{"type":"string"},"company":{"type":"string"},"dashboardType":{"type":"number"},"uuid":{"type":"string"}},"required":["name","location","link","company","dashboardType","uuid"]}}}},"responses":{"201":{}},"method":"post","path":"/dashboard-accordion/{uuid}/general-information-dashboard"}'
  })
export class DashboardAccordionGeneralInformationDashboardControllerSubmitByIdCommand extends OpenApiOperationCommand<void, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
