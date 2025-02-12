import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-options.response';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_getLocationControlOptions',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDashboardController_getLocationControlOptions","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"object","properties":{"name":{"type":"string"},"uuid":{"type":"string"},"value":{"type":"string"},"display":{"type":"string"}},"required":["name","uuid","value","display"]}}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-dashboard/control/location/options"}'
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse> {
    return super.execute(parameters);
  }
}
