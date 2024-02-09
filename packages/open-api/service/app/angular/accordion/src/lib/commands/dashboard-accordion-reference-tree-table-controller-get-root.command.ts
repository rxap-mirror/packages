import { OpenApiOperationCommand, OperationCommand } from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DashboardAccordionReferenceTreeTableControllerGetRootResponse } from '../responses/dashboard-accordion-reference-tree-table-controller-get-root.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
    serverId: 'service-app-angular-accordion',
    operationId: 'DashboardAccordionReferenceTreeTableController_getRoot',
    operation: '{"operationId":"DashboardAccordionReferenceTreeTableController_getRoot","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"object","properties":{"uuid":{"type":"string"},"hasChildren":{"type":"boolean"},"children":{"type":"array","items":{"$ref":"#/components/schemas/DashboardAccordionReferenceTreeTableItemDto"}}},"required":["uuid","hasChildren"]}}}}}},"method":"get","path":"/dashboard-accordion/{uuid}/reference-tree-table"}'
  })
export class DashboardAccordionReferenceTreeTableControllerGetRootCommand extends OpenApiOperationCommand<DashboardAccordionReferenceTreeTableControllerGetRootResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DashboardAccordionReferenceTreeTableControllerGetRootResponse> {
    return super.execute(parameters);
  }
}
