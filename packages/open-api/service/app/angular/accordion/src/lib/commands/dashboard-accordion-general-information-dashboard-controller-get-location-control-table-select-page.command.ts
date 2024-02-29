import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.response';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionGeneralInformationDashboardController_getLocationControlTableSelectPage',
    operation: '{"operationId":"DashboardAccordionGeneralInformationDashboardController_getLocationControlTableSelectPage","parameters":[{"name":"pageIndex","required":false,"in":"query","schema":{"type":"number"}},{"name":"pageSize","required":false,"in":"query","schema":{"type":"number"}},{"name":"sortDirection","required":false,"in":"query","schema":{"type":"string"}},{"name":"sortBy","required":false,"in":"query","schema":{"type":"string"}},{"name":"filter","required":false,"in":"query","schema":{"type":"array","items":{"type":"string"}}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"rows":{"type":"array","items":{"$ref":"#/components/schemas/DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto"}},"pageSize":{"type":"number"},"pageIndex":{"type":"number"},"total":{"type":"number"},"sortDirection":{"type":"string"},"sortBy":{"type":"string"},"filter":{"type":"array","items":{"$ref":"#/components/schemas/FilterQueryDto"}}},"required":["rows","pageSize","pageIndex","total"]}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/general-information-dashboard/control/location/table-select/page"}'
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageCommand extends OpenApiOperationCommand<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse, DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter, void>): Promise<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse> {
    return super.execute(parameters);
  }
}
