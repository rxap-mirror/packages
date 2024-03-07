import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.response';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_resolveLocationControlValue',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDashboardController_resolveLocationControlValue","parameters":[{"name":"value","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"__value":{"type":"string"},"__display":{"type":"string"},"name":{"type":"string"},"uuid":{"type":"string"},"__rowId":{"type":"string"}},"required":["__value","__display","name","uuid","__rowId"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-dashboard/control/location/resolve/{value}"}'
  })
export class DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse, DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void>): Promise<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse> {
    return super.execute(parameters);
  }
}
