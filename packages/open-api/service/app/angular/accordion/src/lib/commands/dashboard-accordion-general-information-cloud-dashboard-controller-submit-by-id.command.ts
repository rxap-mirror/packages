import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.request-body';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationCloudDashboardController_submitById',
    operation: '{"operationId":"DashboardAccordionGeneralInformationCloudDashboardController_submitById","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}}],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}}}},"responses":{"201":{}},"method":"post","path":"/dashboard-accordion/{uuid}/general-information-cloud-dashboard"}'
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdCommand extends OpenApiOperationCommand<void, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
