import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionReferenceTreeTableControllerGetRootResponse } from '../responses/dashboard-accordion-reference-tree-table-controller-get-root.response';
import { DashboardAccordionReferenceTreeTableControllerGetRootParameter } from '../parameters/dashboard-accordion-reference-tree-table-controller-get-root.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionReferenceTreeTableController_getRoot',
    operation: '{"operationId":"DashboardAccordionReferenceTreeTableController_getRoot","parameters":[{"name":"filter","required":false,"in":"query","schema":{"type":"array","items":{"type":"string"}}},{"name":"sortBy","required":false,"in":"query","schema":{"type":"string"}},{"name":"sortDirection","required":false,"in":"query","schema":{"type":"string"}},{"name":"pageSize","required":false,"in":"query","schema":{"type":"number"}},{"name":"pageIndex","required":false,"in":"query","schema":{"type":"number"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"object","properties":{"referenced":{"type":"boolean"},"name":{"type":"string"},"type":{"type":"string"},"hasChildren":{"type":"boolean"},"children":{"type":"array","items":{"$ref":"#/components/schemas/DashboardAccordionReferenceTreeTableItemDto"}}},"required":["referenced","name","type","hasChildren"]}}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/reference-tree-table"}'
  })
export class DashboardAccordionReferenceTreeTableControllerGetRootCommand extends OpenApiOperationCommand<DashboardAccordionReferenceTreeTableControllerGetRootResponse, DashboardAccordionReferenceTreeTableControllerGetRootParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<DashboardAccordionReferenceTreeTableControllerGetRootParameter, void>): Promise<DashboardAccordionReferenceTreeTableControllerGetRootResponse> {
    return super.execute(parameters);
  }
}
