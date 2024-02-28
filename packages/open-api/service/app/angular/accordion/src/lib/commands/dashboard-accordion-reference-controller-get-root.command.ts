import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionReferenceControllerGetRootParameter } from '../parameters/dashboard-accordion-reference-controller-get-root.parameter';
import { DashboardAccordionReferenceControllerGetRootResponse } from '../responses/dashboard-accordion-reference-controller-get-root.response';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionReferenceController_getRoot',
    operation: '{"operationId":"DashboardAccordionReferenceController_getRoot","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}},{"name":"pageIndex","required":false,"in":"query","schema":{"type":"number"}},{"name":"pageSize","required":false,"in":"query","schema":{"type":"number"}},{"name":"sortDirection","required":false,"in":"query","schema":{"type":"string"}},{"name":"sortBy","required":false,"in":"query","schema":{"type":"string"}},{"name":"filter","required":false,"in":"query","schema":{"type":"array","items":{"type":"string"}}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"object","properties":{"referenced":{"type":"boolean"},"name":{"type":"string"},"type":{"type":"string"},"hasChildren":{"type":"boolean"},"children":{"type":"array","items":{"$ref":"#/components/schemas/DashboardAccordionReferenceItemDto"}}},"required":["referenced","name","type","hasChildren"]}}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/reference"}'
  })
export class DashboardAccordionReferenceControllerGetRootCommand extends OpenApiOperationCommand<DashboardAccordionReferenceControllerGetRootResponse, DashboardAccordionReferenceControllerGetRootParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionReferenceControllerGetRootParameter, void>): Promise<DashboardAccordionReferenceControllerGetRootResponse> {
    return super.execute(parameters);
  }
}
