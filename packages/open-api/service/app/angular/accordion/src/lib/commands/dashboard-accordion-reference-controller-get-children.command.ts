import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DashboardAccordionReferenceControllerGetChildrenParameter } from '../parameters/dashboard-accordion-reference-controller-get-children.parameter';
import { DashboardAccordionReferenceControllerGetChildrenResponse } from '../responses/dashboard-accordion-reference-controller-get-children.response';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionReferenceController_getChildren',
    operation: '{"operationId":"DashboardAccordionReferenceController_getChildren","parameters":[{"name":"uuid","required":true,"in":"path","schema":{"type":"string"}},{"name":"pageIndex","required":false,"in":"query","schema":{"type":"number"}},{"name":"pageSize","required":false,"in":"query","schema":{"type":"number"}},{"name":"sortDirection","required":false,"in":"query","schema":{"type":"string"}},{"name":"sortBy","required":false,"in":"query","schema":{"type":"string"}},{"name":"filter","required":false,"in":"query","schema":{"type":"array","items":{"type":"string"}}},{"name":"parentUuid","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"object","properties":{"referenced":{"type":"boolean"},"name":{"type":"string"},"type":{"type":"string"},"hasChildren":{"type":"boolean"},"children":{"type":"array","items":{"$ref":"#/components/schemas/DashboardAccordionReferenceItemDto"}},"uuid":{"type":"string"}},"required":["referenced","name","type","hasChildren","uuid"]}}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/reference/{parentUuid}"}'
  })
export class DashboardAccordionReferenceControllerGetChildrenCommand extends OpenApiOperationCommand<DashboardAccordionReferenceControllerGetChildrenResponse, DashboardAccordionReferenceControllerGetChildrenParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionReferenceControllerGetChildrenParameter, void>): Promise<DashboardAccordionReferenceControllerGetChildrenResponse> {
    return super.execute(parameters);
  }
}
